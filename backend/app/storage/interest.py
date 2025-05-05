# 📄 backend/app/storage/interest.py

import logging
from app.lib.supabase import get_supabase_admin_client


def save_interest(name: str, email: str) -> None:
    """
    Save interest submission to the Supabase 'interest' table.
    This uses the service role key (admin) to bypass RLS for public inserts.
    """
    try:
        payload = {"name": name, "email": email}
        response = get_supabase_admin_client().table("interest").insert(payload).execute()

        if hasattr(response, "error") and response.error:
            logging.error(f"[❌ save_interest] Supabase error: {response.error}")
        else:
            logging.info(f"[✅ save_interest] Interest saved for: {email}")

    except Exception as e:
        logging.exception(f"[❌ save_interest] Exception occurred while saving interest: {e}")
