# backend/app/api/me.py

from fastapi import APIRouter, Depends
from app.auth.supabase_auth import get_supabase_user
from app.storage.user import get_user_approved_status

router = APIRouter()

@router.get("/me")
async def get_me(user=Depends(get_supabase_user)):
    print("[🔍 DEBUG user]")

    approved = await get_user_approved_status(user["id"])

    return {
        "id": user["id"],
        "email": user["email"],
        "role": user.get("user_metadata", {}).get("role", "unknown"),
        "approved": approved,
    }
