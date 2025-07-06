import stripe
import json
from fastapi import APIRouter, Request, Header, HTTPException
import logging

from fastapi.responses import JSONResponse
import httpx

from app.api.payments import process_successful_payment_intent
from app.config import ENODE_WEBHOOK_SECRET, STRIPE_WEBHOOK_SECRET  # se till att du har detta i .env
from app.lib.webhook_logic import process_event  # lagd i separat fil för logik
from app.storage.user import add_user_sms_credits, get_ha_webhook_settings, get_user_id_by_stripe_customer_id, remove_stripe_customer_id, update_user_subscription
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
        invoice_id = invoice.get("id")
        customer_id = invoice.get("customer")
        subscription_id = invoice.get("subscription") # Denna bör finnas för prenumerationsfakturor

        user_id = None
        plan_id = None # Kommer nu från prenumerationens metadata

        logger.info(f"[✅] Invoice paid: id={invoice_id}, customer_id={customer_id}")

        if subscription_id:
            try:
                # Hämta den senaste versionen av prenumerationsobjektet
                subscription = stripe.Subscription.retrieve(subscription_id)
                
                # Hämta user_id och plan_id från prenumerationens metadata
                user_id = subscription.get("metadata", {}).get("user_id")
                plan_id = subscription.get("metadata", {}).get("plan_id") # Detta är den plan_id du själv satte!
                
                logger.info(f"[ℹ️] Retrieved sub {subscription_id} for invoice {invoice_id}. User ID from sub metadata: {user_id}, Plan ID from sub metadata: {plan_id}")

            except Exception as e:
                logger.error(f"[❌] Failed to retrieve subscription {subscription_id} for invoice {invoice_id}: {e}", exc_info=True)
                # Försök i sista hand hämta user_id från fakturans metadata (om satt)
                user_id = invoice.get("metadata", {}).get("user_id")
                # Om user_id fortfarande inte finns, kan vi inte uppdatera
                if not user_id:
                    logger.warning(f"[⚠️] Could not determine user_id for paid invoice {invoice_id}. Skipping user update.")
                    return {"status": "success"} # Avsluta här om vi inte kan koppla till en användare

        else: # Om fakturan inte är kopplad till en prenumeration (t.ex. engångsköp av SMS-paket)
            user_id = invoice.get("metadata", {}).get("user_id")
            plan_id = invoice.get("metadata", {}).get("plan_id")
            logger.info(f"[ℹ️] Non-subscription invoice {invoice_id}. User ID from invoice metadata: {user_id}, Plan ID from invoice metadata: {plan_id}")

        # Logga informationen före DB-uppdatering
        logger.info(f"[✅] Invoice paid: id={invoice_id} user_id={user_id}, plan_id={plan_id}, amount={invoice.get('amount_due')}, status={invoice.get('status')}")

        try:
            await upsert_invoice_from_stripe(invoice, user_id=user_id)
            logger.info(f"[DB] Invoice marked as paid in DB: {invoice_id}")
        except Exception as e:
            logger.error(f"[❌] Failed to mark invoice as paid in DB: {invoice_id} – {e}", exc_info=True)

        # Hantera user/plan-uppdatering om user_id och plan_id hittats
        if user_id and plan_id:
            # Om det är en prenumerationsplan (t.ex. 'pro_monthly'), extrahera tier
            if "_monthly" in plan_id or "_yearly" in plan_id: # Anpassa baserat på dina plan_id namngivningar
                tier = plan_id.split("_")[0] # 'pro_monthly' -> 'pro'
            elif plan_id.startswith("sms_"): # Hantera SMS-paket
                # SMS-paket behöver inte uppdatera 'tier' i användarobjektet på samma sätt,
                # utan hanteras av 'checkout.session.completed' för engångsbetalningar.
                # Om du har recurring SMS-paket, kan det behövas mer logik här.
                logger.info(f"[ℹ️] SMS package '{plan_id}' paid, user tier update not applicable here.")
                tier = None # Säkerställ att vi inte försöker uppdatera tier för SMS-köp här
            else:
                tier = plan_id # För andra typer av planer som matchar direkt
                logger.warning(f"[⚠️] Unrecognized plan_id format '{plan_id}'. Using as-is for tier.")

            if tier:
                logger.info(f"[➡️] Updating user {user_id} subscription to tier {tier}")
                try:
                    await update_user_subscription(user_id=user_id, tier=tier)
                    logger.info(f"[✅] Updated {tier.capitalize()} for user {user_id}")
                except Exception as e:
                    logger.error(f"[❌] Failed to update subscription for user {user_id} to tier {tier}: {e}", exc_info=True)
            else:
                logger.info(f"[ℹ️] No tier update performed for plan_id '{plan_id}' for user {user_id}.")
        else:
            logger.warning(f"[⚠️] Paid invoice {invoice_id} received, but user_id ({user_id}) or plan_id ({plan_id}) was missing for tier update.")

        # Logga att webhook-eventet är behandlat
        await log_stripe_webhook(event, status="processed")
        return {"status": "success"}
    
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
        user_id = sub.get("metadata", {}).get("user_id") # Föredrar metadata om den är satt
        plan_id = sub.get("metadata", {}).get("plan_id") # Föredrar metadata om den är satt
        subscription_id = sub.get("id")

        # Fallback om metadata inte är satt (även om det borde vara det)
        if not user_id and sub.get("customer"):
            # Försök hämta user_id via customer_id om det behövs
            user_id = await get_user_id_by_stripe_customer_id(sub.get("customer"))
        
        # Hämta den *aktuella* price_id från prenumerationens linjeobjekt
        current_price_id_on_sub = sub.get("items", {}).get("data", [{}])[0].get("price", {}).get("id")
        
        # Försök mappa till intern tier
        tier = None
        if current_price_id_on_sub:
            from app.storage.subscription import get_price_id_map # Se till att denna import är korrekt
            price_id_map = await get_price_id_map()
            for internal_plan_id, stripe_id in price_id_map.items():
                if stripe_id == current_price_id_on_sub:
                    tier = internal_plan_id.split("_")[0]
                    break
            if not tier:
                logger.warning(f"[Stripe] Sub {subscription_id}: Could not map current_price_id {current_price_id_on_sub} to an internal tier.")

        logger.info(f"[DB] Subscription upserted: id={subscription_id} status={sub.get('status')} customer_id={sub.get('customer')} user_id={user_id} tier={tier}")
        
        try:
            await upsert_subscription_from_stripe(sub, user_id=user_id)
            # Uppdatera användarens tier baserat på den nya prenumerationsstatusen
            if user_id and tier:
                await update_user_subscription(user_id=user_id, tier=tier, status=sub.get('status'))
                logger.info(f"[✅] User {user_id} tier updated to {tier} from sub.updated webhook.")
            elif user_id and not tier:
                logger.warning(f"[⚠️] Sub {subscription_id}: User {user_id} updated, but no tier could be determined for update from sub.updated webhook.")
        except Exception as e:
            logger.error(f"[❌] Failed to upsert subscription and update user tier for sub {subscription_id}: {e}", exc_info=True)

        # Logga att webhook-eventet är behandlat
        await log_stripe_webhook(event, status="processed")
        return {"status": "success"}

    elif event_type == "customer.subscription.deleted":
        subscription = data_object
        user_id = None
        subscription_id = subscription.get("id")
        customer_id = subscription.get("customer")
        # Metadata safe extraction
        metadata = getattr(subscription, "metadata", {}) or subscription.get("metadata", {}) or {}
        user_id = metadata.get("user_id")
        
        if not user_id and customer_id:
            user_id = await get_user_id_by_stripe_customer_id(customer_id)
            logger.info(f"[ℹ️] Fetched user_id={user_id} via stripe_customer_id={customer_id}")

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
