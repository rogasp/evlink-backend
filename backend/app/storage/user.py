# backend/app/storage/user.py

from app.storage.db import supabase
from uuid import uuid4
from datetime import datetime
from typing import Optional


def create_user(email: str, name: str, hashed_password: str) -> dict:
    user_id = str(uuid4())
    try:
        response = supabase.table("users").insert({
            "id": user_id,
            "email": email,
            "name": name,
            "hashed_password": hashed_password,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        return response.data[0] if response.data else {}
    except Exception as e:
        print(f"❌ create_user() failed for {email}: {e}")
        return {}


def get_user_by_email(email: str) -> Optional[dict]:
    try:
        response = supabase.table("users").select("*").eq("email", email).maybe_single().execute()
        return response.data
    except Exception as e:
        print(f"❌ get_user_by_email({email}) failed: {e}")
        return None


def get_user(user_id: str) -> Optional[dict]:
    try:
        response = supabase.table("users").select("id, email, created_at").eq("id", user_id).maybe_single().execute()
        return response.data
    except Exception as e:
        print(f"❌ get_user({user_id}) failed: {e}")
        return None


def user_exists(user_id: str) -> bool:
    try:
        response = supabase.table("users").select("id").eq("id", user_id).maybe_single().execute()
        return bool(response.data)
    except Exception as e:
        print(f"❌ user_exists({user_id}) failed: {e}")
        return False


def update_user_email(user_id: str, new_email: str):
    try:
        supabase.table("users").update({"email": new_email}).eq("id", user_id).execute()
        print(f"📧 Updated email for user {user_id} to {new_email}")
    except Exception as e:
        print(f"❌ update_user_email({user_id}) failed: {e}")
