# 📄 backend/app/storage/interest.py

import logging
import uuid
from app.lib.supabase import get_supabase_admin_client
from datetime import datetime

logger = logging.getLogger(__name__)

supabase = get_supabase_admin_client()

def save_interest(name: str, email: str) -> None:
    """
    Save interest submission to the Supabase 'interest' table.
    This uses the service role key (admin) to bypass RLS for public inserts.
    """
    try:
        payload = {"name": name, "email": email}
        response = supabase.table("interest").insert(payload).execute()

        if hasattr(response, "error") and response.error:
            logger.error(f"[❌ save_interest] Supabase error: {response.error}")
        else:
            logger.info(f"[✅ save_interest] Interest saved for: {email}")

    except Exception as e:
        logger.exception(f"[❌ save_interest] Exception occurred while saving interest: {e}")

async def get_uncontacted_interest_entries():
    """Retrieves all interest entries that have not yet been contacted."""
    response = supabase.table("interest") \
        .select("*") \
        .eq("contacted", False) \
        .execute()
    return response.data or []

async def mark_interest_contacted(entry_id: str):
    """Marks an interest entry as contacted with the current timestamp."""
    return supabase.table("interest") \
        .update({
            "contacted": True,
            "contacted_at": datetime.utcnow().isoformat()
        }) \
        .eq("id", entry_id) \
        .execute()

async def list_interest_entries():
    """Lists all interest entries, ordered by creation date (newest first)."""
    response = supabase.table("interest") \
        .select("id, name, email, created_at, contacted, contacted_at, access_code") \
        .order("created_at", desc=True) \
        .execute()
    return response.data or []

async def count_uncontacted_interest():
    """Counts the number of interest entries that have not yet been contacted."""
    response = supabase.table("interest") \
        .select("id", count="exact") \
        .eq("contacted", False) \
        .execute()
    return response.count or 0

async def get_interest_by_access_code(code: str) -> dict | None:
    """Retrieves an interest entry by its unique access code."""
    result = supabase.table("interest") \
        .select("id, name, email, access_code, user_id") \
        .eq("access_code", code) \
        .maybe_single() \
        .execute()
    return result.data

async def assign_interest_user(code: str, user_id: str):
    """Assigns a user ID to an interest entry using its access code."""
    supabase.table("interest") \
        .update({"user_id": user_id}) \
        .eq("access_code", code) \
        .execute()

async def generate_codes_for_interest_ids(interest_ids: list[str]) -> int:
    """Generates unique, shorter access codes for specified interest entries that don't already have one."""
    updated_count = 0

    for interest_id in interest_ids:
        result = supabase.table("interest") \
            .select("id, access_code") \
            .eq("id", interest_id) \
            .maybe_single() \
            .execute()

        row = result.data
        if row and not row.get("access_code"):
            new_code = uuid.uuid4().hex[:10]  # shorter code
            supabase.table("interest") \
                .update({"access_code": new_code}) \
                .eq("id", interest_id) \
                .execute()
            updated_count += 1

    return updated_count

async def get_interest_by_id(interest_id: str):
    """Retrieves an interest entry by its ID."""
    result = supabase.table("interest") \
        .select("id, name, email, access_code, user_id") \
        .eq("id", interest_id) \
        .maybe_single() \
        .execute()

    return result.data