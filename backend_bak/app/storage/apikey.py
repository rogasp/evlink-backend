from app.storage.db import supabase
from uuid import uuid4
import hashlib
import secrets
from typing import Optional



def get_user_id_from_api_key(api_key: str) -> Optional[str]:
    """
    Verifies a plaintext API key by comparing hash and returns user_id if valid.
    """
    try:
        hashed = hash_api_key(api_key)
        response = supabase.table("apikeys") \
            .select("user_id") \
            .eq("key_hash", hashed) \
            .eq("active", True) \
            .maybe_single() \
            .execute()
        return response.data["user_id"] if response.data else None
    except Exception as e:
        print("❌ get_user_id_from_api_key() failed:", str(e))
        return None


def list_all_api_keys() -> list[dict]:
    try:
        response = supabase.table("apikeys") \
            .select("user_id, id, created_at, active") \
            .execute()
        return response.data if response.data else []
    except Exception as e:
        print("❌ list_all_api_keys() failed:", str(e))
        return []
