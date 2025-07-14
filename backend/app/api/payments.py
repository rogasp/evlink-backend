# backend/app/api/payments.py
# This module handles all Stripe payment interactions, including subscriptions and one-time purchases.

import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
import stripe
from stripe import StripeObject

from app.config import STRIPE_SECRET_KEY, SUCCESS_URL, CANCEL_URL
from app.auth.supabase_auth import get_supabase_user
from app.storage.user import (
    add_user_sms_credits,
    get_user_by_id,
    update_user_stripe_id,
    update_user_subscription,
)
from app.storage.subscription import get_price_id_map
from app.services.stripe_utils import handle_subscription_plan_change_request

logger = logging.getLogger(__name__)

# Initialize the Stripe API with the secret key
stripe.api_key = STRIPE_SECRET_KEY

router = APIRouter()


class PaymentRequest(BaseModel):
    """Defines the expected request body for the /checkout endpoint."""
    action: str = Field(..., description="The payment action to perform: 'subscribe', 'change_plan', 'cancel', 'purchase_sms', 'purchase_add_on'")
    plan_id: str = Field(None, alias="planId", description="The identifier for the subscription plan or SMS package.")

    class Config:
        allow_population_by_field_name = True


class PaymentResponse(BaseModel):
    """Defines the response body for the /checkout endpoint."""
    clientSecret: str | None = None
    status: str


@router.post("/checkout", response_model=PaymentResponse)
async def handle_checkout(
    req: PaymentRequest,
    user=Depends(get_supabase_user),
):
    """
    A unified endpoint to handle various Stripe payment actions.
    - Subscribing to a new plan.
    - Changing an existing subscription plan.
    - Canceling a subscription.
    - Purchasing one-time items like SMS credit packages.
    """
    logger.info(f"[💳] Checkout called: action={req.action}, plan_id={req.plan_id}, user={user.get('id')}")

    # --- 1. Initial Setup & Validation ---
    price_id_map = await get_price_id_map()
    price_id = price_id_map.get(req.plan_id or "")

    # Ensure the requested plan_id is valid for actions that require it.
    if req.action in ("subscribe", "purchase_sms", "change_plan") and not price_id:
        logger.error(f"[❌] Invalid plan_id: '{req.plan_id}'. Available: {list(price_id_map.keys())}")
        raise HTTPException(
            400,
            f"Invalid plan_id '{req.plan_id}', must be one of {list(price_id_map.keys())}"
        )

    # --- 2. Retrieve User & Ensure Stripe Customer ---
    user_record = await get_user_by_id(user["id"])
    if not user_record:
        logger.error(f"[❌] User not found: {user['id']}")
        raise HTTPException(404, "User not found")

    # Create a Stripe Customer if one doesn't already exist for the user.
    customer_id = user_record.stripe_customer_id
    if not customer_id:
        logger.info(f"[ℹ️] Creating Stripe customer for user: {user_record.email}")
        customer = stripe.Customer.create(
            email=user_record.email,
            metadata={"user_id": user_record.id},
        )
        await update_user_stripe_id(user_record.id, customer.id)
        customer_id = customer.id
        logger.info(f"[✅] Created Stripe customer: {customer_id}")

    # --- 3. Handle Specific Payment Actions ---

    # A. SUBSCRIBE to a new plan
    if req.action == "subscribe":
        logger.info(f"[🟢] Starting subscription for plan_id: {req.plan_id}, price_id: {price_id}")
        
        # If the user is on a trial, pass the trial end date to Stripe.
        trial_end_timestamp = None
        if user_record.is_on_trial and user_record.trial_ends_at:
            try:
                trial_end_dt = datetime.fromisoformat(user_record.trial_ends_at)
                trial_end_timestamp = int(trial_end_dt.timestamp())
                logger.info(f"[ℹ️] User {user_record.id} is on trial, setting Stripe trial_end to {trial_end_timestamp}")
            except (ValueError, TypeError) as e:
                logger.error(f"[❌] Error parsing trial_ends_at for user {user_record.id}: {e}")

        # Prepare parameters for the Stripe Checkout Session.
        session_params = {
            "customer": customer_id,
            "payment_method_types": ["card"],
            "mode": "subscription",
            "line_items": [{"price": price_id, "quantity": 1}],
            "success_url": SUCCESS_URL,
            "cancel_url": CANCEL_URL,
            "metadata": {"user_id": user_record.id, "plan_id": req.plan_id},
        }
        if trial_end_timestamp:
            session_params["subscription_data"] = {"trial_end": trial_end_timestamp}

        session = stripe.checkout.Session.create(**session_params)
        logger.info(f"[✅] Stripe Checkout Session created: {session.id}")
        return {"clientSecret": session.id, "status": "subscription_created"}

    # B. CHANGE an existing subscription plan
    elif req.action == "change_plan":
        logger.info(f"[🔄] Change plan requested for customer {customer_id} to plan_id: {req.plan_id} (price_id: {price_id})")
        
        trial_end_timestamp = None
        if user_record.is_on_trial and user_record.trial_ends_at:
            try:
                trial_end_dt = datetime.fromisoformat(user_record.trial_ends_at)
                trial_end_timestamp = int(trial_end_dt.timestamp())
                logger.info(f"[ℹ️] User {user_record.id} is on trial, setting Stripe trial_end for plan change to {trial_end_timestamp}")
            except (ValueError, TypeError) as e:
                logger.error(f"[❌] Error parsing trial_ends_at for user {user_record.id} during plan change: {e}")

        try:
            # Delegate the complex logic of changing a plan to a dedicated service function.
            await handle_subscription_plan_change_request(
                customer_id=customer_id,
                new_price_id=price_id,
                user_id=user_record.id,
                trial_end=trial_end_timestamp
            )
            logger.info(f"[✅] Change plan processed by Stripe service successfully.")
            return {"clientSecret": None, "status": "subscription_change_processed"}
        except ValueError as e: 
            logger.error(f"[❌] Failed to change plan (ValueError): {e}")
            raise HTTPException(400, str(e))
        except Exception as e: 
            logger.error(f"[❌] Unexpected error changing plan: {e}", exc_info=True)
            raise HTTPException(500, "Internal server error during plan change.")

    # C. CANCEL an active subscription
    elif req.action == "cancel":
        logger.info(f"[🛑] Cancel subscription requested for customer {customer_id}")
        subs = stripe.Subscription.list(customer=customer_id, status='active', limit=1)
        if not subs.data:
            logger.warning("[⚠️] No active subscription to cancel for this customer")
            raise HTTPException(400, "No active subscription to cancel")
        
        # Use delete for immediate cancellation. For cancellation at period end, use `stripe.Subscription.modify`.
        stripe.Subscription.delete(subs.data[0].id)
        logger.info(f"[✅] Subscription {subs.data[0].id} canceled successfully.")
        return {"clientSecret": None, "status": "subscription_canceled"}

    # D. PURCHASE a one-time item (e.g., SMS pack or API tokens)
    elif req.action == "purchase_add_on":
        logger.info(f"[📦] Purchase add-on requested: {req.plan_id} (price_id: {price_id}) for customer {customer_id}")
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            mode="payment", # 'payment' mode for one-time purchases
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=SUCCESS_URL,
            cancel_url=CANCEL_URL,
            metadata={"user_id": user_record.id, "plan_id": req.plan_id},
        )
        logger.info(f"[✅] Stripe Checkout Session created for add-on: {session.id}")
        return {"clientSecret": session.id, "status": "add_on_purchase_initiated"}

    # Fallback for an invalid action
    logger.error(f"[❌] Invalid action: {req.action}")
    raise HTTPException(400, f"Invalid action '{req.action}'")


async def process_successful_payment_intent(
    user_id: str,
    payment_intent: StripeObject
) -> None:
    """
    Business logic for the 'payment_intent.succeeded' webhook event.
    This function is called when a one-time payment (like an SMS pack or API tokens) succeeds.
    It expects payment_intent.metadata to include:
      - user_id: the Supabase user ID
      - plan_id: one of 'sms_50', 'sms_100', 'token_2500', etc.
    """
    metadata = getattr(payment_intent, "metadata", {}) or {}
    plan_id = metadata.get("plan_id")

    if not plan_id:
        logger.warning("[⚠️] No plan_id in payment_intent.metadata, skipping webhook processing.")
        return

    logger.info(f"Processing successful payment for user {user_id} with plan_id {plan_id}")

    if plan_id.startswith("sms_"):
        try:
            credits = int(plan_id.split("_")[1])
            await add_user_sms_credits(user_id=user_id, credits=credits)
            logger.info(f"Added {credits} SMS credits to user {user_id}")
        except (IndexError, ValueError) as e:
            logger.error(f"[❌] Invalid SMS plan_id format '{plan_id}' in payment_intent for user {user_id}: {e}")
    elif plan_id.startswith("token_"):
        try:
            tokens = int(plan_id.split("_")[1])
            await add_purchased_api_tokens(user_id=user_id, quantity=tokens)
            logger.info(f"Added {tokens} API tokens to user {user_id}")
        except (IndexError, ValueError) as e:
            logger.error(f"[❌] Invalid token plan_id format '{plan_id}' in payment_intent for user {user_id}: {e}")
    else:
        logger.warning(f"Unknown plan_id '{plan_id}' in payment_intent.metadata")
        