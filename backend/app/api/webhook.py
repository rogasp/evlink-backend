import stripe
import json
from fastapi import APIRouter, Request, Header, HTTPException
import logging

from fastapi.responses import JSONResponse
import httpx

from app.api.payments import process_successful_payment_intent
from app.config import ENODE_WEBHOOK_SECRET, STRIPE_WEBHOOK_SECRET  # se till att du har detta i .env
from app.lib.webhook_logic import process_event  # lagd i separat fil för logik
from app.storage.user import add_user_sms_credits, get_ha_webhook_settings, remove_stripe_customer_id, update_user_subscription
from app.storage.subscription import update_subscription_status, upsert_subscription_from_stripe
from app.enode.verify import verify_signature
from app.storage.webhook import save_webhook_event
from app.services.stripe_utils import log_stripe_webhook
from app.storage.invoice import upsert_invoice_from_stripe

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
        await log_stripe_webhook({"type": "invalid", "raw": str(payload)}, status="error", error=str(e))
        logger.error(f"[❌] Stripe signature verification failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

    event_type = event["type"]
    data_object = event["data"]["object"]
    event_id = event.get("id")
    logger.info(f"[🔔] Stripe event received: type={event_type} event_id={event_id}")

    # Logga allt till Supabase
    await log_stripe_webhook(event, status="received")

    if event_type == "checkout.session.completed":
        session = data_object
        user_id = session.get("metadata", {}).get("user_id")
        plan_id = session.get("metadata", {}).get("plan_id")
        logger.info(f"[ℹ️] Checkout completed: user_id={user_id}, plan_id={plan_id}, mode={session.get('mode')}, event_id={event_id}")

        if not user_id or not plan_id:
            logger.warning(f"[⚠️] Missing user_id or plan_id in session metadata, event_id={event_id}")
        else:
            if session.get("mode") == "payment":
                credits = 50 if plan_id == "sms_50" else 100
                logger.info(f"[➡️] Adding SMS credits: {credits} to user {user_id}")
                try:
                    await add_user_sms_credits(user_id=user_id, credits=credits)
                    logger.info(f"[✅] Added {credits} SMS credits for user {user_id}")
                except Exception as e:
                    logger.error(f"[❌] Failed to add SMS credits for user {user_id}: {e}")

            elif session.get("mode") == "subscription":
                tier = plan_id.split("_")[0] if "_" in plan_id else plan_id
                logger.info(f"[➡️] Activating subscription for user {user_id} to tier {tier}")
                try:
                    await update_user_subscription(user_id=user_id, tier=tier)
                    logger.info(f"[✅] Activated {tier.capitalize()} subscription for user {user_id}")
                except Exception as e:
                    logger.error(f"[❌] Failed to activate subscription for user {user_id}: {e}")

    elif event_type == "invoice.payment_succeeded":
        invoice = data_object
        user_id = invoice.get("metadata", {}).get("user_id")
        plan_id = invoice.get("metadata", {}).get("plan_id")
        logger.info(f"[✅] Invoice paid: id={invoice.get('id')} user_id={user_id}, plan_id={plan_id}, amount={invoice.get('amount_due')}, status={invoice.get('status')}")
        try:
            await upsert_invoice_from_stripe(invoice, user_id=user_id)
            logger.info(f"[DB] Invoice marked as paid in DB: {invoice.get('id')}")
        except Exception as e:
            logger.error(f"[❌] Failed to mark invoice as paid in DB: {invoice.get('id')} – {e}")

        # Hantera även ev. user/plan-uppdatering
        if user_id:
            tier = plan_id.split("_")[0] if plan_id and "_" in plan_id else plan_id
            if tier:
                logger.info(f"[➡️] Renewing subscription for user {user_id} to tier {tier}")
                try:
                    await update_user_subscription(user_id=user_id, tier=tier)
                    logger.info(f"[✅] Renewed {tier.capitalize()} for user {user_id}")
                except Exception as e:
                    logger.error(f"[❌] Failed to renew subscription for user {user_id}: {e}")

    elif event_type == "invoice.created":
        invoice = data_object
        user_id = invoice.get("metadata", {}).get("user_id")
        logger.info(f"[📝] Invoice created: id={invoice.get('id')} user_id={user_id} amount={invoice.get('amount_due')} status={invoice.get('status')}")
        try:
            await upsert_invoice_from_stripe(invoice, user_id=user_id)
            logger.info(f"[DB] Invoice inserted/updated: {invoice.get('id')} for user {user_id}")
        except Exception as e:
            logger.error(f"[❌] Failed to upsert invoice: {invoice.get('id')} – {e}")

    elif event_type in ["customer.subscription.created", "customer.subscription.updated"]:
        sub = data_object
        user_id = None
        # Stripe kan ibland använda .metadata eller ["metadata"]
        if hasattr(sub, "metadata") and sub.metadata:
            user_id = sub.metadata.get("user_id")
        elif sub.get("metadata"):
            user_id = sub.get("metadata").get("user_id")
        try:
            await upsert_subscription_from_stripe(sub, user_id=user_id)
            logger.info(f"[DB] Subscription upserted: id={sub.get('id')} status={sub.get('status')} customer_id={sub.get('customer')} user_id={user_id}")
        except Exception as e:
            logger.error(f"[❌] Failed to upsert subscription: id={sub.get('id')} error={e}")

    elif event_type == "customer.subscription.deleted":
        subscription = data_object
        user_id = None
        subscription_id = subscription.get("id")
        customer_id = subscription.get("customer")
        # Metadata safe extraction
        metadata = getattr(subscription, "metadata", {}) or subscription.get("metadata", {}) or {}
        user_id = metadata.get("user_id")
        
        logger.info(
            f"[🛑] Subscription canceled: subscription_id={subscription_id}, user_id={user_id}, customer_id={customer_id}"
        )

        try:
            # 1. Sätt status till canceled i egen subscriptions-tabell
            await update_subscription_status(subscription_id, status="canceled")
            logger.info(f"[DB] Subscription {subscription_id} marked as canceled in DB")

            # 2. Sätt användarens tier till free
            if user_id:
                await update_user_subscription(user_id=user_id, tier="free", status="canceled")
                logger.info(f"[🔴] User {user_id} set to free tier")
            else:
                logger.warning(f"[⚠️] No user_id found in subscription metadata for {subscription_id}")

            # 3. Kontrollera om Stripe-kund finns kvar
            try:
                customer = stripe.Customer.retrieve(customer_id)
                if customer.get("deleted", False):
                    logger.info(f"[🗑️] Stripe customer {customer_id} has been deleted. Removing from users table.")
                    if user_id:
                        await remove_stripe_customer_id(user_id)
                        logger.info(f"[DB] Removed stripe_customer_id for user {user_id}")
                else:
                    logger.info(f"[ℹ️] Stripe customer {customer_id} still exists, not removing from users table.")
            except Exception as e:
                logger.warning(f"[⚠️] Could not verify or delete Stripe customer {customer_id}: {e}")

        except Exception as e:
            logger.error(f"[❌] Error in canceling subscription for user {user_id}, sub {subscription_id}: {e}")

    else:
        logger.debug(f"[ℹ️] Unhandled Stripe event: {event_type} event_id={event_id}")

    return {"status": "received"}
