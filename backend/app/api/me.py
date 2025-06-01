# backend/app/api/me.py

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.auth.supabase_auth import get_supabase_user
from app.storage.user import (
    get_user_accepted_terms,
    get_user_approved_status,
    get_user_by_id,
    get_user_online_status,
)
from app.logger import logger

router = APIRouter()

class MeResponse(BaseModel):
    """
    Response model for GET /me, now including 'is_subscribed'.
    """
    id: str
    email: str
    role: str
    approved: bool
    name: str
    accepted_terms: bool
    online_status: str  # "red", "yellow", "green", "grey"
    notify_offline: bool
    is_subscribed: bool  # NEW: whether the user is subscribed to the newsletter
    

@router.get("/me", response_model=MeResponse)
async def get_me(user=Depends(get_supabase_user)):
    """
    Retrieves the current user's merged data, including subscription status.
    """
    user_id = user["id"]
    try:
        # 1) Fetch approval and terms status
        approved = await get_user_approved_status(user_id)
        terms = await get_user_accepted_terms(user_id)

        # 2) Fetch local user row, which now includes is_subscribed
        local_user = await get_user_by_id(user_id)

        # 3) Fetch online status
        online_status = await get_user_online_status(user_id)

        # Log the raw local_user for debugging
        logger.info(f"[ℹ️] local_user fetched: {local_user}")

        # 4) Determine 'name': prefer user_metadata.name, else local_user.name, else email, else "unknown"
        name = (user.get("user_metadata", {}) or {}).get("name")
        if not name and local_user:
            name = local_user.name
        if not name:
            name = user.get("email")
        name = (name or "").strip() or "unknown"

        # 5) Determine 'email'
        email = (user.get("email") or "").strip() or "unknown"

        # 6) Determine 'role' from user_metadata
        role = user.get("user_metadata", {}).get("role", "unknown")

        # 7) Determine notify_offline (fall back to False if local_user missing)
        notify_offline = getattr(local_user, "notify_offline", False) if local_user else False

        # 8) Determine is_subscribed (fall back to False if local_user missing or field not set)
        is_subscribed = getattr(local_user, "is_subscribed", False) if local_user else False

        # 9) Return the assembled response
        return MeResponse(
            id=user_id,
            email=email,
            role=role,
            approved=approved,
            name=name,
            accepted_terms=terms,
            online_status=online_status,
            notify_offline=notify_offline,
            is_subscribed=is_subscribed,  # NEW field
        )

    except Exception as e:
        logger.error(f"[❌ get_me] Unexpected error: {e}")
        # If an error occurs while fetching, re-raise as appropriate (or customize)
        raise
