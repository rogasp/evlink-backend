"""
backend/app/storage/api_key.py

Storage functions for API key management in EVLink backend.
"""
from typing import Optional
from uuid import uuid4

from app.lib.api_key_utils import generate_api_key, hash_api_key
from app.lib.supabase import get_supabase_admin_client
from app.models.user import User
from app.storage.user import get_user_by_id
import logging

# Module logger
logger = logging.getLogger(__name__)

supabase = get_supabase_admin_client()

def create_api_key(user_id: str) -> str:
    """
    Creates a new API key for a user, deactivates old ones (if any),
    and returns the new plaintext key.
    """
    try:
        new_key = generate_api_key()
        hashed_key = hash_api_key(new_key)
        key_id = str(uuid4())

        logger.info("[create_api_key] Deactivating old keys for user_id=%s", user_id)
        try:
            supabase.table("api_keys") \
                .update({"active": False}) \
                .eq("user_id", user_id) \
                .execute()
        except Exception as update_err:
            logger.warning("[create_api_key] Failed to deactivate old keys: %s", update_err)

        payload = {
            "id": key_id,
            "user_id": user_id,
            "key_hash": hashed_key,
            "active": True
        }

        logger.info("[create_api_key] Inserting new API key with ID=%s", key_id)
        response = supabase.table("api_keys").insert(payload).execute()

        if not response or not getattr(response, 'data', None):
            logger.warning("[create_api_key] Inserted key but no data returned for user_id=%s", user_id)
        else:
            logger.info("[create_api_key] API key created for user_id=%s", user_id)

        return new_key

    except Exception as e:
        logger.error("[create_api_key] Failed for user_id=%s: %s", user_id, e, exc_info=True)
        return ""


def get_api_key_info(user_id: str) -> Optional[dict]:
    """
    Returns metadata for the currently active API key.
    """
    try:
        logger.info("[get_api_key_info] Fetching active key for user_id=%s", user_id)
        response = supabase.table("api_keys") \
            .select("id, created_at, active") \
            .eq("user_id", user_id) \
            .eq("active", True) \
            .maybe_single() \
            .execute()

        if not response:
            logger.warning("[get_api_key_info] No response for user_id=%s", user_id)
            return None
        if response.data:
            logger.info("[get_api_key_info] Found active key for user_id=%s", user_id)
            return response.data
        logger.info("[get_api_key_info] No active key found for user_id=%s", user_id)
        return None
    except Exception as e:
        logger.error("[get_api_key_info] Exception for user_id=%s: %s", user_id, e, exc_info=True)
        return None

async def get_user_by_api_key(api_key: str) -> User | None:
    """
    Returns a User if the provided API key is valid and active.
    """
    try:
        hashed = hash_api_key(api_key)
        logger.info("[get_user_by_api_key] Lookup for API key hash=%s", hashed)
        response = supabase.table("api_keys") \
            .select("user_id") \
            .eq("key_hash", hashed) \
            .eq("active", True) \
            .maybe_single() \
            .execute()

        if not response:
            logger.warning("[get_user_by_api_key] No response for API key lookup")
            return None

        row = getattr(response, 'data', None)
        if not row:
            logger.warning("[get_user_by_api_key] Invalid or inactive API key")
            return None

        return await get_user_by_id(row["user_id"])
    except Exception as e:
        logger.error("[get_user_by_api_key] Exception during lookup: %s", e, exc_info=True)
        return None
