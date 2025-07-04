# backend/app/api/payments.py
# New unified Stripe payment endpoint: subscriptions and SMS packages

import logging
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

logger = logging.getLogger(__name__)

stripe.api_key = STRIPE_SECRET_KEY

router = APIRouter()

class PaymentRequest(BaseModel):
    action: str = Field(..., description="'subscribe', 'change_plan', 'cancel', 'purchase_sms'")
    plan_id: str = Field(None, alias="planId")
    # Eventuella fler fält här

    class Config:
        allow_population_by_field_name = True

class PaymentResponse(BaseModel):
    clientSecret: str | None = None
    status: str

@router.post("/checkout", response_model=PaymentResponse)
async def handle_checkout(
    req: PaymentRequest,
    user=Depends(get_supabase_user),
):
    logger.info(f"[💳] Checkout called: action={req.action}, plan_id={req.plan_id}, user={user.get('id')}")
    price_id_map = await get_price_id_map()
    price_id = price_id_map.get(req.plan_id or "")

    # Check that plan exists where needed
    if req.action in ("subscribe", "purchase_sms", "change_plan") and not price_id:
        logger.error(f"[❌] Invalid plan_id: '{req.plan_id}'. Available: {list(price_id_map.keys())}")
        raise HTTPException(
            400,
            f"Invalid plan_id '{req.plan_id}', must be one of {list(price_id_map.keys())}"
        )

    # 1) Get user record
    user_record = await get_user_by_id(user["id"])
    if not user_record:
        logger.error(f"[❌] User not found: {user['id']}")
        raise HTTPException(404, "User not found")

    # 2) Ensure Stripe Customer
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

    # 3) Handle actions
    if req.action == "subscribe":
        logger.info(f"[🟢] Starting subscription for plan_id: {req.plan_id}, price_id: {price_id}")
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=SUCCESS_URL,
            cancel_url=CANCEL_URL,
            metadata={"user_id": user_record.id, "plan_id": req.plan_id},
        )
        logger.info(f"[✅] Stripe Checkout Session created: {session.id}")
        return {"clientSecret": session.id, "status": "subscription_created"}

    elif req.action == "change_plan":
        logger.info(f"[🔄] Change plan requested to plan_id: {req.plan_id} (price_id: {price_id})")
        # Get active subscription
        subs = stripe.Subscription.list(customer=customer_id, status="active", limit=1)
        if not subs.data:
            logger.error("[❌] No active subscription to update")
            raise HTTPException(400, "No active subscription to update")
        subscription = subs.data[0]
        current_item = subscription["items"]["data"][0]
        current_price_id = current_item["price"]["id"]
        current_unit_amount = current_item["price"]["unit_amount"]
        logger.info(f"[ℹ️] Current price id: {current_price_id} ({current_unit_amount} cents)")

        # Get new price
        new_price = stripe.Price.retrieve(price_id)
        new_unit_amount = new_price["unit_amount"]
        logger.info(f"[ℹ️] New price id: {price_id} ({new_unit_amount} cents)")

        is_upgrade = new_unit_amount > current_unit_amount
        logger.info(f"[🔎] is_upgrade={is_upgrade}")

        if is_upgrade:
            logger.info(f"[⬆️] Upgrading: changing plan immediately with proration")
            stripe.Subscription.modify(
                subscription.id,
                cancel_at_period_end=False,
                proration_behavior="create_prorations",
                items=[{
                    "id": current_item.id,
                    "price": price_id,
                }],
                metadata={"user_id": user_record.id, "plan_id": req.plan_id},
            )
            logger.info(f"[✅] Subscription upgraded immediately")
            return {"clientSecret": None, "status": "subscription_upgraded"}
        else:
            logger.info(f"[⬇️] Downgrading: plan change will occur at end of billing period")
            stripe.Subscription.modify(
                subscription.id,
                cancel_at_period_end=True,
                proration_behavior="none",
                items=[{
                    "id": current_item.id,
                    "price": price_id,
                }],
                metadata={"user_id": user_record.id, "plan_id": req.plan_id},
            )
            logger.info(f"[✅] Subscription downgrade scheduled for period end")
            return {"clientSecret": None, "status": "subscription_downgrade_scheduled"}

    elif req.action == "cancel":
        logger.info(f"[🛑] Cancel subscription requested")
        subs = stripe.Subscription.list(customer=customer_id, limit=1)
        if not subs.data:
            logger.error("[❌] No subscription to cancel")
            raise HTTPException(400, "No subscription to cancel")
        stripe.Subscription.delete(subs.data[0].id)
        logger.info(f"[✅] Subscription canceled")
        return {"clientSecret": None, "status": "subscription_canceled"}

    elif req.action == "purchase_sms":
        logger.info(f"[💬] Purchase SMS pack requested: {req.plan_id} (price_id: {price_id})")
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            mode="payment",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=SUCCESS_URL,
            cancel_url=CANCEL_URL,
            metadata={"user_id": user_record.id, "plan_id": req.plan_id},
        )
        logger.info(f"[✅] Stripe Checkout Session created for SMS: {session.id}")
        return {"clientSecret": session.id, "status": "sms_purchase_initiated"}

    logger.error(f"[❌] Invalid action: {req.action}")
    raise HTTPException(400, f"Invalid action '{req.action}'")


async def process_successful_payment_intent(
    user_id: str,
    payment_intent: StripeObject
) -> None:
    """
    Business logic for Stripe payment_intent.succeeded.
    Expects payment_intent.metadata to include:
      - user_id: the Supabase user ID
      - plan_id: one of 'pro_monthly', 'sms_50', 'sms_100'
    """
    metadata = getattr(payment_intent, "metadata", {}) or {}
    plan_id = metadata.get("plan_id")

    if not plan_id:
        logger.warning("No plan_id in payment_intent.metadata, skipping")
        return

    if plan_id == "pro_monthly":
        # Activate or renew subscription
        await update_user_subscription(user_id=user_id, tier="pro")
        logger.info(f"Activated Pro subscription for user {user_id}")
    elif plan_id == "sms_50":
        # Add 50 SMS credits
        await add_user_sms_credits(user_id=user_id, credits=50)
        logger.info(f"Added 50 SMS credits to user {user_id}")
    elif plan_id == "sms_100":
        # Add 100 SMS credits
        await add_user_sms_credits(user_id=user_id, credits=100)
        logger.info(f"Added 100 SMS credits to user {user_id}")
    else:
        logger.warning(f"Unknown plan_id '{plan_id}' in payment_intent.metadata")
