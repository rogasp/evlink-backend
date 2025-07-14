import stripe
from stripe import StripeObject

import json
from fastapi import APIRouter, Request, Header, HTTPException
import logging

from fastapi.responses import JSONResponse
import httpx

from app.api.payments import process_successful_payment_intent
from app.config import ENODE_WEBHOOK_SECRET, STRIPE_WEBHOOK_SECRET
from app.lib.webhook_logic import process_event
from app.storage.user import add_user_sms_credits, add_purchased_api_tokens, get_ha_webhook_settings, get_user_by_id, get_user_id_by_stripe_customer_id, remove_stripe_customer_id, update_user_subscription, update_user
from app.storage.subscription import get_price_id_map, update_subscription_status, upsert_subscription_from_stripe, get_user_record
from app.enode.verify import verify_signature
from app.storage.webhook import save_webhook_event
from app.services.stripe_utils import log_stripe_webhook
from app.storage.invoice import find_subscription_id, upsert_invoice_from_stripe

# Create a module-specific logger
logger = logging.getLogger(__name__)

router = APIRouter()

async def push_to_homeassistant(event: dict, user_id: str | None):
    """Pushes a single event to Home Assistant via webhook settings in the DB."""
    if not user_id:
        # No logs, just silent return if user is missing (e.g., system hook)
        return

    # Retrieve the user's tier
    user_record = await get_user_record(user_id)
    if not user_record or user_record.get("tier") != "pro":
        logger.info("Webhook push skipped for user %s: Not a Pro tier user.", user_id)
        return

    settings = get_ha_webhook_settings(user_id)
    if not settings or not settings.get("ha_webhook_id") or not settings.get("ha_external_url"):
        logger.error("HA Webhook ID/URL missing in database for user_id=%s", user_id)
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
    """Handles incoming webhooks from Enode, verifies signature, and processes events."""
    try:
        raw_body = await request.body()

        # Verify the signature first
        if not verify_signature(raw_body, x_enode_signature):
            logger.error("❌ Invalid signature – possible spoofed webhook")
            raise HTTPException(status_code=401, detail="Invalid signature")

        # Convert to JSON after verification
        incoming  = json.loads(raw_body)
        logger.info("[📥 Verified webhook payload] %s", incoming)

        # Save and process
        save_webhook_event(incoming)

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

    except Exception as e:
        logging.exception("❌ Failed to handle webhook")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook/stripe", response_model=dict)
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(..., alias="Stripe-Signature"),
):
    """Handles incoming webhooks from Stripe, verifies signature, and processes events."""
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

    # Log all events to Supabase
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
                if plan_id.startswith("sms_"):
                    try:
                        credits = int(plan_id.split("_")[1])
                        logger.info(f"[➡️] Adding SMS credits: {credits} to user {user_id}")
                        await add_user_sms_credits(user_id=user_id, credits=credits)
                        logger.info(f"[✅] Added {credits} SMS credits for user {user_id}")
                    except (IndexError, ValueError) as e:
                        logger.error(f"[❌] Invalid SMS plan_id format '{plan_id}' for user {user_id}: {e}")
                    except Exception as e:
                        logger.error(f"[❌] Failed to add SMS credits for user {user_id}: {e}")
                elif plan_id.startswith("token_"):
                    try:
                        tokens = int(plan_id.split("_")[1])
                        logger.info(f"[➡️] Adding API tokens: {tokens} to user {user_id}")
                        await add_purchased_api_tokens(user_id=user_id, quantity=tokens)
                        logger.info(f"[✅] Added {tokens} API tokens for user {user_id}")
                    except (IndexError, ValueError) as e:
                        logger.error(f"[❌] Invalid token plan_id format '{plan_id}' for user {user_id}: {e}")
                    except Exception as e:
                        logger.error(f"[❌] Failed to add API tokens for user {user_id}: {e}")
                else:
                    logger.warning(f"[⚠️] Unhandled payment plan_id '{plan_id}' for user {user_id}")

            elif session.get("mode") == "subscription":
                # When a subscription is created via checkout.session.completed,
                # customer.subscription.created is also triggered, which handles DB updates.
                # We do not perform DB updates here to avoid double handling.
                logger.info(f"[ℹ️] Subscription checkout completed. DB update deferred to customer.subscription.created webhook.")


    elif event_type == "invoice.payment_succeeded":
        invoice = data_object
        invoice_id = invoice.get("id")
        customer_id = invoice.get("customer")
        
        # Use find_subscription_id for robust retrieval
        subscription_id = find_subscription_id(invoice)
        
        user_id = None
        plan_id = None

        logger.info(f"[DEBUG_INVOICE_PAID] Handling invoice.payment_succeeded for invoice ID: {invoice_id}, Subscription ID: {subscription_id}, Customer ID: {customer_id}")

        # First, try to get user_id and plan_id from the subscription's metadata if sub_id exists
        if subscription_id: 
            try:
                # Retrieve the subscription object to get its metadata
                subscription = stripe.Subscription.retrieve(subscription_id)
                user_id = subscription.get("metadata", {}).get("user_id")
                plan_id = subscription.get("metadata", {}).get("plan_id")
                logger.info(f"[ℹ️] Retrieved sub {subscription_id} for invoice {invoice_id}. User ID from sub metadata: {user_id}, Plan ID from sub metadata: {plan_id}")

            except Exception as e:
                logger.error(f"[❌] Failed to retrieve subscription {subscription_id} for invoice {invoice_id}: {e}", exc_info=True)
                # Fallback to the invoice's own metadata if subscription could not be retrieved
                user_id = invoice.get("metadata", {}).get("user_id")
                plan_id = invoice.get("metadata", {}).get("plan_id")
                logger.warning(f"[⚠️] Fallback to invoice metadata for user/plan. User ID: {user_id}, Plan ID: {plan_id}")
                
        # If subscription_id was not found at all (e.g., one-time payment), get from invoice metadata
        else: 
            user_id = invoice.get("metadata", {}).get("user_id")
            plan_id = invoice.get("metadata", {}).get("plan_id")
            logger.info(f"[ℹ️] Non-subscription invoice {invoice_id}. User ID from invoice metadata: {user_id}, Plan ID from invoice metadata: {plan_id}. Skipping tier update if no user/plan.")
            
        # Last chance to get user_id if it's still None, via customer_id
        if not user_id and customer_id:
            try:
                user_id = await get_user_id_by_stripe_customer_id(customer_id)
                if user_id:
                    logger.info(f"[ℹ️] User ID {user_id} found via customer ID {customer_id}.")
            except Exception as e:
                logger.warning(f"[⚠️] Could not retrieve user_id from DB for customer {customer_id}: {e}")

        # If user_id or plan_id are still missing (which should not happen for subscription invoices now)
        if not user_id or not plan_id:
            logger.warning(f"[⚠️] Paid invoice {invoice_id} received, but user_id ({user_id}) or plan_id ({plan_id}) was missing for tier update. This indicates a problem with metadata propagation.")
            await log_stripe_webhook(event, status="processed", error=f"Missing user_id/plan_id for invoice {invoice_id}")
            return {"status": "success"} # Exit if we don't have enough info

        # Log information before DB update (with the found values)
        logger.info(f"[✅] Invoice paid: id={invoice_id} user_id={user_id}, plan_id={plan_id}, amount={invoice.get('amount_due')}, status={invoice.get('status')}")

        try:
            await upsert_invoice_from_stripe(invoice, user_id=user_id)
            logger.info(f"[DB] Invoice marked as paid in DB: {invoice_id}")
        except Exception as e:
            logger.error(f"[❌] Failed to mark invoice as paid in DB: {invoice_id} – {e}", exc_info=True)

        # Handle user/plan update if user_id and plan_id were found
        if user_id and plan_id: # This if-statement should now always be true if we reached here
            if "_monthly" in plan_id or "_yearly" in plan_id:
                tier = plan_id.split("_")[0]
            elif plan_id.startswith("sms_"):
                logger.info(f"[ℹ️] SMS package '{plan_id}' paid, user tier update not applicable here.")
                tier = None # Ensure we don't try to update tier for SMS purchases here
            else:
                tier = plan_id
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
        # No else here because we already handled the case of missing user_id/plan_id above

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
        subscription_id = sub.get("id")
        customer_id = sub.get("customer")
        
        # Try to get user_id from existing metadata or via customer_id
        user_id = sub.get("metadata", {}).get("user_id")
        if not user_id and customer_id:
            user_id = await get_user_id_by_stripe_customer_id(customer_id)
        
        # Get the internal plan_id based on the current price of the subscription
        current_price_id_on_sub = sub.get("items", {}).get("data", [{}])[0].get("price", {}).get("id")
        internal_plan_id_for_sub = None
        if current_price_id_on_sub:
            price_id_map_data = await get_price_id_map() # Await here
            for p_id, s_id in price_id_map_data.items():
                if s_id == current_price_id_on_sub:
                    internal_plan_id_for_sub = p_id
                    break
            if not internal_plan_id_for_sub:
                logger.warning(f"[Stripe] Sub {subscription_id}: Could not map current_price_id {current_price_id_on_sub} to internal plan_id for metadata.")
                internal_plan_id_for_sub = current_price_id_on_sub # Fallback
        
        # --- CRITICAL: Update subscription metadata directly in Stripe ---
        # This is important so that user_id and plan_id are available on the subscription object
        # when referenced by other webhooks (e.g., invoice.payment_succeeded)
        if user_id and internal_plan_id_for_sub:
            existing_metadata = sub.get("metadata", {}) or {}
            # Only update if metadata is not already present or is different
            if existing_metadata.get("user_id") != user_id or existing_metadata.get("plan_id") != internal_plan_id_for_sub:
                try:
                    updated_sub_with_metadata = stripe.Subscription.modify(
                        subscription_id,
                        metadata={
                            "user_id": user_id,
                            "plan_id": internal_plan_id_for_sub,
                            **existing_metadata # Preserve other existing metadata
                        }
                    )
                    logger.info(f"[✅] Subscription {subscription_id} metadata updated with user_id and plan_id in Stripe.")
                    sub = updated_sub_with_metadata # Use the updated object for further processing in this webhook
                except Exception as e:
                    logger.error(f"[❌] Failed to update metadata for subscription {subscription_id} in Stripe: {e}", exc_info=True)
        # --- SLUT KRITISK LOGIK ---

        tier = None
        if internal_plan_id_for_sub:
            tier = internal_plan_id_for_sub.split("_")[0] if "_" in internal_plan_id_for_sub else internal_plan_id_for_sub
            if not tier: logger.warning(f"[Stripe] Sub {subscription_id}: Could not determine tier from plan_id {internal_plan_id_for_sub}.")


        logger.info(f"[DB] Subscription upserted: id={subscription_id} status={sub.get('status')} customer_id={customer_id} user_id={user_id} tier={tier}")
        
        

        try:
            await upsert_subscription_from_stripe(sub, user_id=user_id) # Ensure upsert_subscription_from_stripe uses user_id
            
            user_record = await get_user_by_id(user_id) # Requires user_id
            old_tier = user_record.tier if user_record else None

            if user_id and tier and old_tier: # Comparison requires both user_id and tier
                # Await the coroutine to get the actual map first
                price_id_map_for_comparison = await get_price_id_map() 
                old_price_id = price_id_map_for_comparison.get(f"{old_tier}_monthly") # Assuming _monthly as default, change if needed
                old_price_obj = stripe.Price.retrieve(old_price_id) if old_price_id else None
                old_unit_amount = old_price_obj.unit_amount if old_price_obj else 0

                new_price_obj = stripe.Price.retrieve(current_price_id_on_sub)
                new_unit_amount = new_price_obj.unit_amount

                if new_unit_amount >= old_unit_amount:
                    await update_user_subscription(user_id=user_id, tier=tier, status=sub.get('status'))
                    logger.info(f"[✅] User {user_id} tier updated to {tier} (immediate: upgrade/same plan) from sub.updated webhook.")
                else: # Detta är en nedgradering som Stripe nu har registrerat
                    logger.info(f"[ℹ️] Downgrade for user {user_id} to {tier} scheduled at period end. DB tier remains {old_tier} for now.")
            else: # Fallback for new sub or if tier/user_id cannot be matched
                await update_user_subscription(user_id=user_id, tier=tier, status=sub.get('status'))
                logger.info(f"[✅] User {user_id} tier updated to {tier} (fallback logic) from sub.updated webhook.")

            # If the subscription is active or in trial, clear is_on_trial and trial_ends_at
            if sub.get("status") in ["active", "trialing"]:
                if user_record.is_on_trial or user_record.trial_ends_at:
                    logger.info(f"[✅] Clearing trial status for user {user_id} due to active Stripe subscription.")
                    await update_user(user_id=user_id, is_on_trial=False, trial_ends_at=None)

        except Exception as e:
            logger.error(f"[❌] Failed to upsert subscription and update user tier for sub {subscription_id}: {e}", exc_info=True)

    elif event_type == "customer.subscription.deleted":
        subscription = data_object
        user_id = None
        subscription_id = subscription.get("id")
        customer_id = subscription.get("customer")
        metadata = getattr(subscription, "metadata", {}) or subscription.get("metadata", {}) or {}
        user_id = metadata.get("user_id")
        
        if not user_id and customer_id:
            user_id = await get_user_id_by_stripe_customer_id(customer_id)
            logger.info(f"[ℹ️] Fetched user_id={user_id} via stripe_customer_id={customer_id}")

        logger.info(
            f"[🛑] Subscription canceled: subscription_id={subscription_id}, user_id={user_id}, customer_id={customer_id}"
        )

        try:
            await update_subscription_status(subscription_id, status="canceled")
            logger.info(f"[DB] Subscription {subscription_id} marked as canceled in DB")

            if user_id:
                await update_user_subscription(user_id=user_id, tier="free", status="canceled")
                logger.info(f"[🔴] User {user_id} set to free tier")
            else:
                logger.warning(f"[⚠️] No user_id found in subscription metadata for {subscription_id}")

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

    await log_stripe_webhook(event, status="processed")
    return {"status": "success"}