import json
from fastapi import APIRouter, Request, Header, HTTPException
import logging

from fastapi.responses import JSONResponse
import stripe

from app.api.payments import process_successful_payment_intent
from app.config import ENODE_WEBHOOK_SECRET, STRIPE_WEBHOOK_SECRET  # se till att du har detta i .env
from app.lib.webhook_logic import process_event  # lagd i separat fil för logik
from app.storage.user import add_user_sms_credits, get_user_by_id, update_user_subscription
from app.enode.verify import verify_signature
from app.storage.webhook import save_webhook_event

# Create a module-specific logger
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/webhook/enode")
async def handle_webhook(
    request: Request,
    x_enode_signature: str = Header(None),
):
    try:
        raw_body = await request.body()

        # ✅ Kontrollera signaturen först
        if not verify_signature(raw_body, x_enode_signature):
            print("❌ Invalid signature – possible spoofed webhook")
            raise HTTPException(status_code=401, detail="Invalid signature")

        # ✅ Konvertera till JSON efter verifiering
        payload = json.loads(raw_body)
        print("[📥 Verified webhook payload]", payload)

        # ✅ Spara och processa
        save_webhook_event(payload)

        if isinstance(payload, list):
            handled = 0
            for event in payload:
                handled += await process_event(event)
            return {"status": "ok", "handled": handled}

        handled = await process_event(payload)
        return {"status": "ok", "handled": handled}

    except Exception as e:
        logging.exception("❌ Failed to handle webhook")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook/stripe", response_model=dict)
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(..., alias="Stripe-Signature"),
):
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=stripe_signature,
            secret=STRIPE_WEBHOOK_SECRET,
        )
    except (ValueError, stripe.error.SignatureVerificationError) as e:
        raise HTTPException(status_code=400, detail=str(e))

    event_type = event["type"]
    data_object = event["data"]["object"]

    if event_type == "checkout.session.completed":
        session = data_object
        user_id = session.get("metadata", {}).get("user_id")
        plan_id = session.get("metadata", {}).get("plan_id")
        if not user_id or not plan_id:
            logger.warning("Missing user_id or plan_id in session metadata")
        else:
            # SMS-paket använder mode=payment, abonnemang mode=subscription
            if session.get("mode") == "payment":
                # SMS‐köp
                await add_user_sms_credits(
                    user_id=user_id,
                    credits=50 if plan_id == "sms_50" else 100
                )
                logger.info(f"Added SMS credits for user {user_id}")
            elif session.get("mode") == "subscription":
                # Pro‐prenumeration
                await update_user_subscription(user_id=user_id, tier="pro")
                logger.info(f"Activated Pro subscription for user {user_id}")

    elif event_type == "invoice.payment_succeeded":
        # Hantera förnyelse av prenumeration
        invoice = data_object
        user_id = invoice.get("metadata", {}).get("user_id")
        if user_id:
            await update_user_subscription(user_id=user_id, tier="pro")
            logger.info(f"Renewed Pro for user {user_id}")

    elif event_type == "customer.subscription.deleted":
        subscription = data_object
        user_id = subscription.metadata.get("user_id")
        # Användaren har sagt upp prenumerationen
        # Sätt tillbaka till Free-plan
        await update_user_subscription(user_id=user_id, tier="free", status="canceled")
        logger.info(f"🔴 Canceled subscription for user {user_id}")

    else:
        logger.debug(f"Unhandled Stripe event: {event_type}")

    return JSONResponse(status_code=200, content={"status": "received"})

