# app/api/public.py

import logging

from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel, EmailStr

from app.enode.link import get_link_result
from app.storage.interest import assign_interest_user, get_interest_by_access_code, save_interest
from app.storage.status_logs import calculate_uptime, get_daily_status, get_status_panel_data
from app.services.brevo import add_or_update_brevo_contact, remove_brevo_contact_from_list
from app.storage.newsletter import create_newsletter_request, remove_public_subscriber, verify_newsletter_request
from app.services.email_utils import send_newsletter_verification_email

router = APIRouter()

logger = logging.getLogger(__name__)

# -------------------------------------------------------------------
# Pydantic models for request bodies
# -------------------------------------------------------------------
class PublicSubscriptionRequest(BaseModel):
    email: EmailStr
    name: str | None = None


class PublicUnsubscribeRequest(BaseModel):
    email: EmailStr

class InterestSubmission(BaseModel):
    name: str
    email: EmailStr


@router.get("/status")
async def status():
    return {"status": "ok"}

@router.get("/ping")
async def ping():
    return {"message": "pong"}

@router.post("/interest")
async def submit_interest(data: InterestSubmission, request: Request):
    try:
        save_interest(data.name, data.email)
        return {"message": "Thanks! We'll notify you when we launch."}
    except Exception as e:
        print(f"❌ Interest submission error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
@router.post("/user/link-result", response_model=dict)
async def post_link_result(data: dict):
    """
    Called by frontend after Enode redirects user back with a linkToken.
    No auth required, but linkToken is validated server-side.
    """
    link_token = data.get("linkToken")
    if not link_token:
        raise HTTPException(status_code=400, detail="Missing linkToken")

    result = await get_link_result(link_token)
    user_id = result.get("userId")
    vendor = result.get("vendor")

    print(f"🔗 Received link result for Enode user_id: {user_id} via token {link_token}")

    if not user_id or not vendor:
        print("⚠️ Incomplete data from Enode in link result")
        raise HTTPException(status_code=400, detail="Invalid link result")

    # Optional: check if user exists in our system
    # from app.storage.users import get_user
    # user = await get_user(user_id)
    # if not user:
    #     print(f"⛔ user_id {user_id} not found in database")
    #     raise HTTPException(status_code=404, detail="Unknown user")

    return {
        "vendor": vendor,
        "userId": user_id,
        "status": "linked"
    }

@router.get("/public/registration-allowed")
async def is_registration_allowed():
    from app.storage.settings import get_setting_by_name
    setting = await get_setting_by_name("allow_registration")
    if not setting:
        return {"allowed": False}
    return {"allowed": setting.get("value") == "true"}

@router.get("/public/status/webhook")
async def webhook_status_panel(
    category: str = Query("webhook_incoming"),
    from_date: datetime = Query(...),
    to_date: datetime = Query(...)
):
    return await get_status_panel_data(category, from_date, to_date)


@router.get("/public/status/webhook/uptime")
async def get_uptime(
    category: str,
    from_date: datetime = Query(default_factory=lambda: datetime.utcnow() - timedelta(days=30)),
    to_date: datetime = Query(default_factory=lambda: datetime.utcnow()),
):
    uptime = await calculate_uptime(category, from_date, to_date)
    return {"uptime": uptime}

@router.get("/public/access-code/{code}")
async def validate_access_code(code: str):
    row = await get_interest_by_access_code(code)

    if not row or row.get("user_id") is not None:
        raise HTTPException(status_code=404, detail="Invalid or used access code")

    return {
        "valid": True,
        "email": row.get("email"),
        "name": row.get("name"),
    }

@router.post("/public/access-code/use")
async def use_access_code(request: Request):
    data = await request.json()
    code = data.get("code")
    user_id = data.get("user_id")

    print(f"[🔐 use_access_code] Incoming: code={code}, user_id={user_id}")

    if not code or not user_id:
        raise HTTPException(status_code=400, detail="Missing code or user_id")

    row = await get_interest_by_access_code(code)
    print(f"[🔍 interest lookup] Found: {row}")

    if not row or row.get("user_id"):
        raise HTTPException(status_code=404, detail="Invalid or already used code")

    await assign_interest_user(code, user_id)
    print(f"[✅ interest updated] {code} → {user_id}")

    return {"success": True}

# -------------------------------------------------------------------
# Endpoint: Public subscribe (step 1: generate verification code and send email)
# -------------------------------------------------------------------
@router.post("/newsletter/subscribe", summary="Public: Request newsletter subscription")
async def public_subscribe(request: PublicSubscriptionRequest):
    """
    1) Create or update a row in `interest` with a verification code.
    2) Send a verification email containing a link with that code.
    """
    email = request.email.strip().lower()
    name = request.name.strip() if (request.name and request.name.strip()) else None

    logger.info("📥 Public subscribe request for email=%s", email)

    # Create or update interest row with verification code
    try:
        rows = await create_newsletter_request(email, name)
        logger.info("✅ Created/updated newsletter request row for %s", email)
    except Exception as e:
        logger.error("❌ Failed to save subscription request for %s: %s", email, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to save subscription request")

    if not rows or len(rows) == 0:
        logger.error("❌ No rows returned after upsert for %s", email)
        raise HTTPException(status_code=500, detail="Unexpected error generating verification code")

    row = rows[0]
    code = row.get("newsletter_verification_code")
    expires_at = row.get("newsletter_code_expires_at")

    if not code or not expires_at:
        logger.error("❌ Verification code missing for %s", email)
        raise HTTPException(status_code=500, detail="Verification code not generated")

    # Send verification email
    try:
        verification_link = f"https://evlinkha.se/api/newsletter/verify?code={code}"
        await send_newsletter_verification_email(
            email=email,
            name=name,
            verification_link=verification_link,
            expires_at=expires_at
        )
        logger.info("✉️ Sent verification email to %s", email)
    except Exception as e:
        logger.error("❌ Failed to send verification email to %s: %s", email, e, exc_info=True)
        return {
            "status": "pending_verification",
            "message": "Subscription request saved, but verification email failed to send"
        }

    return {
        "status": "pending_verification",
        "message": "Verification email sent. Please check your inbox."
    }


@router.get("/newsletter/verify", summary="Verify newsletter subscription")
async def public_verify(code: str = Query(...)):
    """
    1) Verify the subscription code in `interest`.
    2) If valid, add or update the contact in Brevo.
    """
    logger.info("🔍 Verification attempt with code=%s", code)

    # Verify code in database
    try:
        verified_rows = await verify_newsletter_request(code)
    except Exception as e:
        logger.error("❌ Error verifying code %s: %s", code, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Internal error during verification")

    if not verified_rows or len(verified_rows) == 0:
        logger.warning("⚠️ Invalid or expired verification code: %s", code)
        raise HTTPException(status_code=404, detail="Invalid or expired verification link")

    verified_row = verified_rows[0]
    email = verified_row.get("email")
    name = verified_row.get("name") or ""

    # Add or update in Brevo list
    try:
        brevo_response = await add_or_update_brevo_contact(email, name)
    except ApiException as e:
        logger.error("❌ Brevo API error during verification for %s: %s", email, e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Brevo API error: {e}")
    except Exception as e:
        logger.error("❌ Unexpected error adding to Brevo for %s: %s", email, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to add subscriber to Brevo")

    return {
        "status": "success",
        "email": email,
        "brevo_response": brevo_response
    }


@router.post("/newsletter/unsubscribe", summary="Public: Unsubscribe from newsletter")
async def public_unsubscribe(request: PublicUnsubscribeRequest):
    """
    1) Update `interest` to clear newsletter flags.
    2) Remove the contact from the Brevo list.
    """
    email = request.email.strip().lower()
    logger.info("📤 Public unsubscribe request for email=%s", email)

    # Update database
    try:
        await remove_public_subscriber(email)
        logger.info("✅ Unsubscription flagged in interest for %s", email)
    except Exception as e:
        logger.error("❌ Failed to update interest for %s: %s", email, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to update subscription in database")

    # Remove from Brevo list
    try:
        brevo_response = await remove_brevo_contact_from_list(email)
        if brevo_response is None:
            return {"status": "success", "detail": "Not in Brevo list"}
        return {"status": "success", "brevo_response": brevo_response}
    except ApiException as e:
        logger.error("❌ Brevo API error during unsubscribe for %s: %s", email, e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Brevo API error: {e}")
    except Exception as e:
        logger.error("❌ Unexpected error during unsubscribe for %s: %s", email, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Internal error during unsubscribe")
    