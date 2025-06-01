# backend/app/api/newsletter.py

import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

# Storage-layer functions from app/storage/user.py
from app.storage.user import get_user_by_email, set_user_subscription
from app.logger import logger

# Brevo / Sendinblue SDK imports
from brevo_python import Configuration
from brevo_python.api_client import ApiClient
from brevo_python.api.contacts_api import ContactsApi
from brevo_python.rest import ApiException
from brevo_python.models.create_contact import CreateContact
from brevo_python.models.update_contact import UpdateContact

from app.config import BREVO_API_KEY, BREVO_CUSTOMERS_LIST_ID

router = APIRouter(prefix="/newsletter", tags=["newsletter"])

# -------------------------------------------------------------------
# Load Brevo (Sendinblue) configuration from environment variables
# -------------------------------------------------------------------
if not BREVO_API_KEY:
    raise RuntimeError("SENDINBLUE_API_KEY must be set in .env")


# Initialize Brevo client and ContactsApi
brevo_conf = Configuration()
brevo_conf.api_key["api-key"] = BREVO_API_KEY
brevo_api_client = ApiClient(brevo_conf)
contacts_api = ContactsApi(brevo_api_client)


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

@router.post("/subscribe", summary="Subscribe a user to the newsletter")
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

    # 2) Update Supabase: set is_subscribed = True
    try:
        updated_user = await set_user_subscription(request.email, True)
        logger.info(f"📈 Supabase updated is_subscribed=True for {request.email}")
    except Exception as e:
        logger.error(f"[❌] Failed to update subscription in Supabase for {request.email}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update subscription in Supabase: {e}")

    # 3) Add or update contact in Brevo
    try:
        body = CreateContact(
            email=request.email,
            attributes={"FIRSTNAME": user.get("name", "")},
            list_ids=[BREVO_CUSTOMERS_LIST_ID],
            update_enabled=True
        )
        try:
            brevo_result = contacts_api.create_contact(body)
            logger.info(f"✅ Created new Brevo contact for {request.email}")
        except ApiException as e:
            # If contact already exists (HTTP 400 or 409), update their list IDs instead
            if e.status in (400, 409):
                logger.info(f"🔄 Contact already exists in Brevo, updating list IDs for {request.email}")
                update_body = UpdateContact(list_ids=[BREVO_CUSTOMERS_LIST_ID])
                brevo_result = contacts_api.update_contact(request.email, update_body)
                logger.info(f"✅ Updated Brevo contact list IDs for {request.email}")
            else:
                logger.error(f"[❌] Brevo API error while creating contact for {request.email}: {e}")
                raise

        return {
            "status": "success",
            "supabase_user": updated_user,
            "brevo_response": brevo_result.to_dict() if brevo_result else {}
        }
    except ApiException as brevo_err:
        logger.error(f"[❌] Brevo API error for {request.email}: {brevo_err}")
        raise HTTPException(status_code=500, detail=f"Brevo API error: {brevo_err}")
    except Exception as e:
        logger.error(f"[❌] Internal error during subscribe for {request.email}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")


# -------------------------------------------------------------------
# Endpoint: Unsubscribe a user
# -------------------------------------------------------------------

@router.post("/unsubscribe", summary="Unsubscribe a user from the newsletter")
async def unsubscribe(request: UnsubscribeRequest):
    """
    1) Fetch the user in Supabase by email.
    2) If found, set is_subscribed = False in Supabase.
    3) Remove the contact from Brevo’s list (Customers Newsletter).
    """
    logger.info(f"📤 Received unsubscribe request for email={request.email}")

    # 1) Fetch user from Supabase
    user = await get_user_by_email(request.email)
    if not user:
        logger.warning(f"[⚠️] User not found in Supabase for unsubscribe: {request.email}")
        updated_user = None
    else:
        # 2) Update Supabase: set is_subscribed = False
        try:
            updated_user = await set_user_subscription(request.email, False)
            logger.info(f"📉 Supabase updated is_subscribed=False for {request.email}")
        except Exception as e:
            logger.error(f"[❌] Failed to update subscription in Supabase for {request.email}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to update subscription in Supabase: {e}")

    # 3) Remove from Brevo’s list
    try:
        existing_contact = contacts_api.get_contact_info(request.email)
        existing_list_ids = existing_contact.list_ids or []
        if BREVO_CUSTOMERS_LIST_ID not in existing_list_ids:
            logger.info(f"ℹ️ Contact {request.email} not in list {BREVO_CUSTOMERS_LIST_ID}, skipping removal.")
            return {
                "status": "success",
                "supabase_user": updated_user,
                "detail": "Contact not in Brevo list"
            }

        new_list_ids = [lid for lid in existing_list_ids if lid != BREVO_CUSTOMERS_LIST_ID]
        update_body = UpdateContact(list_ids=new_list_ids)
        brevo_result = contacts_api.update_contact(request.email, update_body)
        logger.info(f"✅ Removed list ID {BREVO_CUSTOMERS_LIST_ID} from Brevo contact {request.email}")

        return {
            "status": "success",
            "supabase_user": updated_user,
            "brevo_response": brevo_result.to_dict() if brevo_result else {}
        }
    except ApiException as e:
        if hasattr(e, "status") and e.status == 404:
            logger.warning(f"[⚠️] Brevo contact not found for {request.email}, nothing to remove.")
            return {
                "status": "success",
                "detail": "Contact not found in Brevo – nothing to remove"
            }
        logger.error(f"[❌] Brevo API error during unsubscribe for {request.email}: {e}")
        raise HTTPException(status_code=500, detail=f"Brevo API error: {e}")
    except Exception as e:
        logger.error(f"[❌] Internal error during unsubscribe for {request.email}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")
