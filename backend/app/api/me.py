# backend/app/api/me.py

from fastapi import APIRouter, Depends
from app.auth.supabase_auth import get_supabase_user

router = APIRouter()

@router.get("/me")
async def get_me(user=Depends(get_supabase_user)):
    print("[🔍 DEBUG user]", user)
    

    return {
        "id": user["id"],
        "email": user["email"],
        "role": user.get("user_metadata", {}).get("role", "unknown"),
    }
