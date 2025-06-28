import json
from fastapi import APIRouter, Request, Header, HTTPException
import logging

from fastapi.responses import JSONResponse
import httpx
import stripe

from app.api.payments import process_successful_payment_intent
from app.config import ENODE_WEBHOOK_SECRET, STRIPE_WEBHOOK_SECRET  # se till att du har detta i .env
from app.lib.webhook_logic import process_event  # lagd i separat fil för logik
from app.storage.user import add_user_sms_credits, get_ha_webhook_settings, update_user_subscription
from app.enode.verify import verify_signature
from app.storage.webhook import save_webhook_event

# Create a module-specific logger
logger = logging.getLogger(__name__)

router = APIRouter()

async def push_to_homeassistant(event: dict, user_id: str | None):
    """Pusha ett enskilt event till Home Assistant via webhook-inställningar i DB."""
    if not user_id:
        # Inga loggar, bara tyst return om user saknas (t.ex. systemhook)
        return

    settings = get_ha_webhook_settings(user_id)
    if not settings or not settings.get("ha_webhook_id") or not settings.get("ha_external_url"):
        logger.error("HA Webhook ID/URL saknas i databasen för user_id=%s", user_id)
        return

    url = f"{settings['ha_external_url'].rstrip('/')}/api/webhook/{settings['ha_webhook_id']}"
    logger.debug("Pushing to HA webhook %s → %s", url, event)
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=event, timeout=10.0)
            resp.raise_for_status()
            logger.info("Successfully pushed event to HA: HTTP %s", resp.status_code)
    except Exception as e:
        logger.error("Failed to push to HA webhook: %s", e)


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
        incoming  = json.loads(raw_body)
        print("[📥 Verified webhook payload]", incoming )

        # ✅ Spara och processa
        save_webhook_event(incoming )

        # # ─── TEST: Duplicate payload ───────────────────────────────────
        # if isinstance(incoming, list):
        #     payloads = incoming * 3
        # else:
        #     payloads = [incoming] * 3

        # logger.warning("🔧 [TEST MODE] payloads length: %d", len(payloads))
        # # ────────────────────────────────────────────────────────────────


        handled = 0

        if isinstance(incoming, list):
            for idx, event in enumerate(incoming):
                logger.info("[📥 #%d/%d] Processing webhook event: %s", idx+1, len(incoming), event.get("event"))
                handled += await process_event(event)
                user_id = event.get('user', {}).get('id')
                await push_to_homeassistant(event, user_id)
        else:
            logger.info("[📥 Single] Processing webhook event: %s", incoming.get("event"))
            handled += await process_event(incoming)
            user_id = incoming.get('user', {}).get('id')
            await push_to_homeassistant(incoming, user_id)

        logger.info("Handled total %d events", handled)
        return {"status": "ok", "handled": handled}

        # handled = await process_event(payload)
        # return {"status": "ok", "handled": handled}

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

