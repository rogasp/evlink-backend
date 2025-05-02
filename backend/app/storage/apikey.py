from app.storage.db import supabase
from uuid import uuid4
import hashlib
import secrets
from typing import Optional


def generate_api_key() -> str:
    """Generate a secure random API key."""
    return secrets.token_urlsafe(32)


def hash_api_key(api_key: str) -> str:
    """Hash the API key before storing it."""
    return hashlib.sha256(api_key.encode()).hexdigest()


def create_api_key(user_id: str) -> str:
    """
    Creates a new API key for a user, deactivates old ones (if any),
    and returns the new plaintext key.
    """
    try:
        new_key = generate_api_key()
        hashed_key = hash_api_key(new_key)
        key_id = str(uuid4())

        print(f"[🧪 UPDATE DEBUG] Deactivating old keys for user_id: {user_id}")
        try:
            supabase.table("apikeys") \
                .update({"active": False}) \
                .eq("user_id", user_id) \
                .execute()
        except Exception as update_err:
            print(f"⚠️ update() threw an error but continuing anyway: {update_err}")

        payload = {
            "id": key_id,
            "user_id": user_id,
            "key_hash": hashed_key,
            "active": True
        }

        response = supabase.table("apikeys").insert(payload).execute()

        print(f"[🧪 INSERT DEBUG] Payload: {payload}")
        print(f"[🧪 INSERT DEBUG] Response: {response}")

        if not response.data:
            print(f"⚠️ API key created but response.data is empty.")
        else:
            print(f"✅ API key created and stored for user_id: {user_id}")

        return new_key

    except Exception as e:
        print(f"❌ create_api_key() failed for {user_id}: {e}")
        return ""


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


def get_api_key_info(user_id: str) -> Optional[dict]:
    """
    Returns metadata for the currently active API key.
    """
    try:
        response = supabase.table("apikeys") \
            .select("id, created_at, active") \
            .eq("user_id", user_id) \
            .eq("active", True) \
            .maybe_single() \
            .execute()
        return response.data if response.data else None
    except Exception as e:
        print(f"❌ get_api_key_info({user_id}) exception:", str(e))
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
