# backend/app/api/newsletter.py

from fastapi import APIRouter, Depends, HTTPException, Request, Request
from pydantic import BaseModel, EmailStr

from app.storage.user import get_user_by_email
from app.storage.newsletter import set_subscriber
from app.logger import logger

from brevo_python.rest import ApiException

from app.services.brevo import (
    add_or_update_brevo_contact,
    get_brevo_subscription_status,
    remove_brevo_contact_from_list,
)

from app.config import BREVO_CUSTOMERS_LIST_ID
from app.auth.supabase_auth import get_supabase_user

router = APIRouter(prefix="/newsletter", tags=["newsletter"])

# -------------------------------------------------------------------
# Request models (Pydantic)
# -------------------------------------------------------------------

class SubscriptionRequest(BaseModel):
    """
    Request body for subscribing a user to the newsletter.
    """
    email: EmailStr

class UnsubscribeRequest(BaseModel):
    """
    Request body for unsubscribing a user from the newsletter.
    """
    email: EmailStr

# -------------------------------------------------------------------
# Endpoint: Subscribe a user
# -------------------------------------------------------------------

@router.post("/manage/subscribe", summary="Subscribe an existing user")
async def subscribe(request: SubscriptionRequest):
    """
    1) Fetch the user in Supabase by email.
    2) If found, set is_subscribed = True in Supabase.
    3) Add or update the contact in Brevo’s list (Customers Newsletter).
    """
    logger.info(f"📥 Received subscribe request for email={request.email}")

    # 1) Fetch user from Supabase
    user = await get_user_by_email(request.email)
    if not user:
        logger.warning(f"[⚠️] User not found in Supabase: {request.email}")
        raise HTTPException(status_code=404, detail="User not found in Supabase")

     # 2) Update/insert interest row
    try:
        updated_rows = await set_subscriber(request.email, True)
        logger.info("📈 Set newsletter flags for %s", request.email)
    except Exception as e:
        logger.error("❌ Failed to update subscription for %s: %s", request.email, e)
        raise HTTPException(status_code=500, detail=f"Failed to update subscription in database: {e}")

    # 3) Add or update contact in Brevo
    try:
        brevo_result = await add_or_update_brevo_contact(
            request.email,
            user.get("name", "") if user else "",
        )
        return {
            "status": "success",
            "subscriber": updated_rows[0] if updated_rows else None,
            "brevo_response": brevo_result,
        }
    except ApiException as brevo_err:
        logger.error("❌ Brevo API error for %s: %s", request.email, brevo_err)
        raise HTTPException(status_code=500, detail=f"Brevo API error: {brevo_err}")
    except Exception as e:
        logger.error("❌ Internal error during subscribe for %s: %s", request.email, e)
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")

# -------------------------------------------------------------------
# Endpoint: Unsubscribe a user
# -------------------------------------------------------------------

@router.post("/manage/unsubscribe", summary="Unsubscribe an existing user")
async def unsubscribe(request: UnsubscribeRequest):
    """
    1) Fetch the user in Supabase by email.
    2) If found, set is_subscribed = False in Supabase.
    3) Remove the contact from Brevo’s list (Customers Newsletter).
    """
    logger.info(f"📤 Received unsubscribe request for email={request.email}")

    # 1) Update/insert interest row
    try:
        updated_rows = await set_subscriber(request.email, False)
        logger.info("📤 Cleared newsletter flags for %s", request.email)
    except Exception as e:
        logger.error("❌ Failed to update subscription for %s: %s", request.email, e)
        raise HTTPException(status_code=500, detail=f"Failed to update subscription in database: {e}")

    # 2) Remove from Brevo’s list
    try:
        brevo_result = await remove_brevo_contact_from_list(request.email)
        if brevo_result is None:
            return {
                "status": "success",
                "subscriber": updated_rows[0] if updated_rows else None,
                "detail": "Contact not in Brevo list",
            }
        return {
            "status": "success",
            "subscriber": updated_rows[0] if updated_rows else None,
            "brevo_response": brevo_result,
        }
    except ApiException as e:
        logger.error("❌ Brevo API error during unsubscribe for %s: %s", request.email, e)
        raise HTTPException(status_code=500, detail=f"Brevo API error: {e}")
    except Exception as e:
        logger.error("❌ Internal error during unsubscribe for %s: %s", request.email, e)
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")
       
@router.get("/manage/status")
async def newsletter_status(
    user=Depends(get_supabase_user)
):
    email = user.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Missing email")
    try:
        is_subscribed = await get_brevo_subscription_status(email)
        return {"is_subscribed": is_subscribed}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not check status: {e}")

