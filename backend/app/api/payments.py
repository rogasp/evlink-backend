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

# >>> NY IMPORT HÄR: Importera den nya funktionen från stripe_utils <<<
from app.services.stripe_utils import handle_subscription_plan_change_request

logger = logging.getLogger(__name__)

# Se till att Stripe API-nyckeln sätts korrekt, som den redan gör
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
        logger.info(f"[🔄] Change plan requested for customer {customer_id} to plan_id: {req.plan_id} (price_id: {price_id})")
        
        try:
            # >>> ANROPA DEN KONSOLIDERADE TJÄNSTEN HÄR ISTÄLLET <<<
            # All logik för att hämta subs, avgöra upp/nedgradering och fakturera ligger nu i service-lagret
            await handle_subscription_plan_change_request(
                customer_id=customer_id,
                new_price_id=price_id,
                user_id=user_record.id # Skicka med user_id
            )
            logger.info(f"[✅] Change plan processed by Stripe service successfully.")
            # Uppdatera statusmeddelandet för att reflektera att servicen hanterade det
            return {"clientSecret": None, "status": "subscription_change_processed"}
        except ValueError as e: # Fånga specifika fel från service-lagret (t.ex. "No active subscription")
            logger.error(f"[❌] Failed to change plan (ValueError): {e}")
            raise HTTPException(400, str(e))
        except Exception as e: # Fånga andra oväntade fel
            logger.error(f"[❌] Unexpected error changing plan: {e}", exc_info=True)
            raise HTTPException(500, "Internal server error during plan change.")

    elif req.action == "cancel":
        logger.info(f"[🛑] Cancel subscription requested for customer {customer_id}")
        subs = stripe.Subscription.list(customer=customer_id, limit=1)
        if not subs.data:
            logger.error("[❌] No subscription to cancel for this customer")
            raise HTTPException(400, "No subscription to cancel")
        stripe.Subscription.delete(subs.data[0].id)
        logger.info(f"[✅] Subscription canceled")
        return {"clientSecret": None, "status": "subscription_canceled"}

    elif req.action == "purchase_sms":
        logger.info(f"[💬] Purchase SMS pack requested: {req.plan_id} (price_id: {price_id}) for customer {customer_id}")
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
        