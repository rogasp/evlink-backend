"""
backend/app/api/payments.py

Endpoints for Stripe integration: create a Checkout Session and handle Stripe webhooks.
"""

import os
from pydantic import BaseModel
import stripe
import logging
import json

from fastapi import APIRouter, HTTPException, Request, Header
from fastapi.responses import JSONResponse
from app.config import STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

# Initialize Stripe with secret key
stripe.api_key = STRIPE_SECRET_KEY

router = APIRouter()
logger = logging.getLogger(__name__)

# 1. Create a Checkout Session
class CreateCheckoutSessionRequest(BaseModel):
    price_id: str
    customer_email: str

class CreateCheckoutSessionResponse(BaseModel):
    session_id: str

@router.post("/create-checkout-session", response_model=CreateCheckoutSessionResponse)
async def create_checkout_session(payload: CreateCheckoutSessionRequest):
    """
    Create a Stripe Checkout Session for a one-time payment or subscription.
    Frontend must send `price_id` (e.g. "price_XXXXXXXX") and `customer_email`.
    """
    try:
        # Example: one-time payment
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="payment",  # "subscription" om ni gör abonnemang
            line_items=[{
                "price": payload.price_id,
                "quantity": 1,
            }],
            customer_email=payload.customer_email,
            success_url=os.getenv("FRONTEND_BASE_URL") + "/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=os.getenv("FRONTEND_BASE_URL") + "/cancelled",
        )
        return CreateCheckoutSessionResponse(session_id=checkout_session.id)
    except Exception as e:
        logger.error(f"Failed to create Stripe Checkout Session: {e}")
        raise HTTPException(status_code=500, detail="Unable to create checkout session")


# 2. Handle Stripe Webhook
@router.post("/stripe-webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="Stripe-Signature")
):
    """
    Verify incoming Stripe webhook, then process relevant events.
    """
    payload = await request.body()
    sig_header = stripe_signature

    try:
        event = stripe.Webhook.construct_event(
            payload=payload, sig_header=sig_header, secret=STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"⚠️ Webhook signature verification failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Hantera olika event-typer från Stripe
    event_type = event["type"]
    data_object = event["data"]["object"]

    if event_type == "checkout.session.completed":
        # Här kan ni uppdatera databasen: markera order som betald, ge användare åtkomst etc.
        session = data_object
        logger.info(f"🪙 Checkout session succeeded: {session['id']}")
        # EXEMPEL: call a service function, t.ex. process_successful_payment(session)
        # await process_successful_payment(session)
    elif event_type == "invoice.payment_succeeded":
        invoice = data_object
        logger.info(f"🪙 Invoice paid: {invoice['id']}")
        # EXEMPEL: hantera återkommande betalning
    else:
        logger.info(f"⚠️ Unhandled event type: {event_type}")

    return JSONResponse(status_code=200, content={"status": "received"})
