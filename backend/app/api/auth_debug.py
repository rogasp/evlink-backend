# backend/app/api/auth_debug.py

from fastapi import APIRouter, Depends, HTTPException, Request
from app.auth.supabase_auth import get_supabase_user

router = APIRouter()

@router.get("/auth/me")
async def get_me(user=Depends(get_supabase_user)):
    return {
        "id": user.id,
        "email": user.email,
        "role": user.user_metadata.get("role", "unknown"),
        "provider": user.app_metadata.get("provider", "unknown")
    }
