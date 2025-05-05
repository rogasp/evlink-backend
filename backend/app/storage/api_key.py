# 📄 backend/app/storage/api_key.py

from typing import Optional
from uuid import uuid4
from app.lib.api_key_utils import generate_api_key, hash_api_key
from app.lib.supabase import get_supabase_admin_client

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

        print(f"[🔄 create_api_key] Deactivating old keys for user_id: {user_id}")
        try:
            supabase.table("api_keys") \
                .update({"active": False}) \
                .eq("user_id", user_id) \
                .execute()
        except Exception as update_err:
            print(f"[⚠️ update failed] Continuing anyway: {update_err}")

        payload = {
            "id": key_id,
            "user_id": user_id,
            "key_hash": hashed_key,
            "active": True
        }

        print(f"[📤 insert] Storing new key with ID: {key_id}")
        response = supabase.table("api_keys").insert(payload).execute()

        if not response.data:
            print(f"[⚠️ insert warning] Key inserted but no data returned.")
        else:
            print(f"[✅ insert] API key created for user_id: {user_id}")

        return new_key

    except Exception as e:
        print(f"[❌ create_api_key] Failed for {user_id}: {e}")
        return ""

def get_api_key_info(user_id: str) -> Optional[dict]:
    """
    Returns metadata for the currently active API key.
    """
    try:
        print(f"[🔍 get_api_key_info] Fetching active key for user_id: {user_id}")
        response = supabase.table("api_keys") \
            .select("id, created_at, active") \
            .eq("user_id", user_id) \
            .eq("active", True) \
            .maybe_single() \
            .execute()

        if response.data:
            print(f"[✅ get_api_key_info] Found active key for user_id: {user_id}")
        else:
            print(f"[ℹ️ get_api_key_info] No active key found for user_id: {user_id}")

        return response.data if response.data else None
    except Exception as e:
        print(f"[❌ get_api_key_info] Exception for {user_id}: {e}")
        return None
