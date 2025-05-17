# backend/app/api/me.py

from fastapi import APIRouter, Depends
from app.auth.supabase_auth import get_supabase_user
from app.storage.user import get_user_approved_status, get_user_by_id

router = APIRouter()

@router.get("/me")
async def get_me(user=Depends(get_supabase_user)):
    print("[🔍 DEBUG user]", user)

    approved = await get_user_approved_status(user["id"])
    local_user = await get_user_by_id(user["id"])

    # 1. Name från user_metadata
    name = (user.get("user_metadata", {}) or {}).get("name")

    # 2. Om saknas → ta från local_user
    if not name and local_user:
        name = local_user.get("name")

    # 3. Om fortfarande tomt → ta från email
    if not name:
        name = user.get("email")

    # 4. Om även email saknas → fallback till "unknown"
    name = (name or "").strip() or "unknown"

    # Email separat (med samma fallback)
    email = (user.get("email") or "").strip() or "unknown"

    return {
        "id": user["id"],
        "email": email,
        "role": user.get("user_metadata", {}).get("role", "unknown"),
        "approved": approved,
        "name": name,
    }


