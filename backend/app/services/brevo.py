# backend/app/services/brevo.py

import logging
from brevo_python import Configuration
from brevo_python.api_client import ApiClient
from brevo_python.api.contacts_api import ContactsApi
from brevo_python.rest import ApiException
from brevo_python.models.create_contact import CreateContact
from brevo_python.models.update_contact import UpdateContact

from app.config import BREVO_API_KEY, BREVO_CUSTOMERS_LIST_ID

logger = logging.getLogger(__name__)

if not BREVO_API_KEY:
    raise RuntimeError("BREVO_API_KEY must be set in .env")

# Initialize Brevo client and ContactsApi
_brevo_conf = Configuration()
_brevo_conf.api_key["api-key"] = BREVO_API_KEY
_brevo_client = ApiClient(_brevo_conf)
_contacts_api = ContactsApi(_brevo_client)


async def add_or_update_brevo_contact(email: str, first_name: str | None):
    """
    Create a new Brevo contact with the Customers list ID, or update an existing contact's list IDs.

    - email: subscriber's email address
    - first_name: attribute for the contact's FIRSTNAME field (can be empty string or None)
    Returns the Brevo API response (dict) on success.
    Raises ApiException on Brevo errors.
    """
    name_attr = first_name or ""
    body = CreateContact(
        email=email,
        attributes={"FIRSTNAME": name_attr},
        list_ids=[BREVO_CUSTOMERS_LIST_ID],
        update_enabled=True
    )
    try:
        brevo_response = _contacts_api.create_contact(body)
        logger.info("✅ Created new Brevo contact for %s", email)
    except ApiException as e:
        if e.status in (400, 409):
            logger.info("🔄 Brevo contact exists, updating list IDs for %s", email)
            update_body = UpdateContact(list_ids=[BREVO_CUSTOMERS_LIST_ID])
            brevo_response = _contacts_api.update_contact(email, update_body)
            logger.info("✅ Updated Brevo contact list IDs for %s", email)
        else:
            logger.error("❌ Brevo API error creating contact for %s: %s", email, e)
            raise
    return brevo_response.to_dict()


async def remove_brevo_contact_from_list(email: str):
    """
    Remove the Customers list ID from an existing Brevo contact, leaving other list IDs intact.

    - email: subscriber's email address
    Returns the Brevo API response (dict) on success, or None if contact not in list.
    Raises ApiException on Brevo errors.
    """
    try:
        existing_contact = _contacts_api.get_contact_info(email)
    except ApiException as e:
        if hasattr(e, "status") and e.status == 404:
            logger.warning("⚠️ Brevo contact not found for %s, nothing to remove", email)
            return None
        logger.error("❌ Brevo API error fetching contact for %s: %s", email, e)
        raise

    existing_list_ids = existing_contact.list_ids or []
    if BREVO_CUSTOMERS_LIST_ID not in existing_list_ids:
        logger.info("ℹ️ Contact %s not in Customers list, skipping removal.", email)
        return None

    new_list_ids = [lid for lid in existing_list_ids if lid != BREVO_CUSTOMERS_LIST_ID]
    update_body = UpdateContact(list_ids=new_list_ids)
    try:
        brevo_response = _contacts_api.update_contact(email, update_body)
        logger.info("✅ Removed Customers list ID from Brevo contact %s", email)
    except ApiException as e:
        logger.error("❌ Brevo API error removing list ID for %s: %s", email, e)
        raise

    return brevo_response.to_dict()
