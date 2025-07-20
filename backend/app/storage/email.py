# backend/app/storage/email.py

import logging
from app.lib.supabase import get_supabase_admin_async_client
from postgrest import APIError

logger = logging.getLogger(__name__)

async def get_email_template(template_name: str, language_code: str) -> dict | None:
    """
    Fetches a specific email template from the database.

    Args:
        template_name: The name of the template (e.g., 'welcome_email').
        language_code: The language code for the template (e.g., 'en', 'sv').

    Returns:
        A dictionary containing the template's subject, html_body, text_body, and is_one_off,
        or None if the template is not found.
    """
    supabase_client = await get_supabase_admin_async_client()
    try:
        response = await (
            supabase_client.table("email_templates")
            .select("subject, html_body, text_body, is_one_off")
            .eq("template_name", template_name)
            .eq("language_code", language_code)
            .limit(1)
            .single()
            .execute()
        )
        
        if response.data:
            logger.info(f"Successfully fetched email template '{template_name}' in '{language_code}'.")
            return response.data
        else:
            logger.warning(f"No email template found for '{template_name}' in '{language_code}'.")
            return None

    except APIError as e:
        logger.error(f"Error fetching email template '{template_name}': {e.message}")
        return None
    except Exception as e:
        logger.error(f"An unexpected error occurred while fetching email template '{template_name}': {e}")
        return None

async def has_email_been_sent(user_id: str, template_name: str) -> bool:
    """
    Checks if a specific one-off email has already been sent to a user.
    """
    supabase_client = await get_supabase_admin_async_client()
    try:
        response = await (
            supabase_client.table("sent_emails")
            .select("id")
            .eq("user_id", user_id)
            .eq("template_name", template_name)
            .limit(1)
            .single()
            .execute()
        )
        return response.data is not None
    except APIError as e:
        if e.code == 'PGRST116': # No rows found
            return False
        logger.error(f"Error checking if email '{template_name}' was sent to user {user_id}: {e.message}")
        return False
    except Exception as e:
        logger.error(f"An unexpected error occurred while checking sent email status for user {user_id}: {e}")
        return False

async def log_sent_email(user_id: str, template_name: str, event_context: dict | None = None):
    """
    Logs that a one-off email has been sent to a user.
    """
    supabase_client = await get_supabase_admin_async_client()
    try:
        data = {
            "user_id": user_id,
            "template_name": template_name,
            "event_context": event_context
        }
        await supabase_client.table("sent_emails").insert(data).execute()
        logger.info(f"Logged sent email '{template_name}' for user {user_id}.")
    except APIError as e:
        logger.error(f"Error logging sent email '{template_name}' for user {user_id}: {e.message}")
    except Exception as e:
        logger.error(f"An unexpected error occurred while logging sent email for user {user_id}: {e}")