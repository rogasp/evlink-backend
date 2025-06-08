# backend/app/api/payments.py
# New unified Stripe payment endpoint: subscriptions and SMS packages
import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
import stripe
from stripe import StripeObject
from app.config import STRIPE_SECRET_KEY, SUCCESS_URL,CANCEL_URL
from app.auth.supabase_auth import get_supabase_user
from app.storage.user import add_user_sms_credits, get_user_by_id, update_user_stripe_id, update_user_subscription

logger = logging.getLogger(__name__)

stripe.api_key = STRIPE_SECRET_KEY

router = APIRouter()

PRICE_ID_MAP = {
    "pro_monthly": "price_1RXjHnKFf1mB4Qj4Tsmtgdh5",  # byt ut mot ditt riktiga price ID
    "sms_50":      "price_1RXjHwKFf1mB4Qj450G5U4WF",  # ditt SMS‐50‐pris
    "sms_100":     "price_1RXjI2KFf1mB4Qj4Vs096snt",  # ditt SMS‐100‐pris
}

# Request: choose action and plan
class PaymentRequest(BaseModel):
    action: str = Field(..., description="'subscribe', 'cancel', 'purchase_sms'")
    plan_id: str = Field(None, alias="planId")

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
    # 1) Hämta användarpost
    user_record = await get_user_by_id(user["id"])
    if not user_record:
        raise HTTPException(404, "User not found")

    # 2) Säkerställ Stripe Customer
    customer_id = user_record.stripe_customer_id
    if not customer_id:
        customer = stripe.Customer.create(
            email=user_record.email,
            metadata={"user_id": user_record.id},
        )
        await update_user_stripe_id(user_record.id, customer.id)
        customer_id = customer.id

    # 3) Hantera olika actions
    if req.action == "subscribe":
        price = PRICE_ID_MAP.get(req.plan_id or "")
        if not price:
            raise HTTPException(
                400,
                f"Invalid plan_id '{req.plan_id}', must be one of {list(PRICE_ID_MAP.keys())}",
            )
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{"price": price, "quantity": 1}],
            success_url=SUCCESS_URL,
            cancel_url=CANCEL_URL,
            metadata={"user_id": user_record.id, "plan_id": req.plan_id},
        )
        return {"clientSecret": session.id, "status": "subscription_created"}

    elif req.action == "cancel":
        subs = stripe.Subscription.list(customer=customer_id, limit=1)
        if not subs.data:
            raise HTTPException(400, "No subscription to cancel")
        stripe.Subscription.delete(subs.data[0].id)
        # Ingen clientSecret behövs vid cancel
        return {"clientSecret": None, "status": "subscription_canceled"}

    elif req.action == "purchase_sms":
        price = PRICE_ID_MAP.get(req.plan_id or "")
        if not price:
            raise HTTPException(400, f"Invalid SMS package '{req.plan_id}'")
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            mode="payment",
            line_items=[{"price": price, "quantity": 1}],
            success_url=SUCCESS_URL,
            cancel_url=CANCEL_URL,
            metadata={"user_id": user_record.id, "plan_id": req.plan_id},
        )
        return {"clientSecret": session.id, "status": "sms_purchase_initiated"}

    # 4) Ogiltig action
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
