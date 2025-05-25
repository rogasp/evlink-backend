# backend/app/api/me.py

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.auth.supabase_auth import get_supabase_user
from app.storage.user import get_user_accepted_terms, get_user_approved_status, get_user_by_id, get_user_online_status

router = APIRouter()

class MeResponse(BaseModel):
    id: str
    email: str
    role: str
    approved: bool
    name: str
    accepted_terms: bool
    online_status: str  # "red", "yellow", "green", "grey"
    notify_offline: bool

@router.get("/me", response_model=MeResponse)
async def get_me(user=Depends(get_supabase_user)):
    approved = await get_user_approved_status(user["id"])
    terms = await get_user_accepted_terms(user["id"])
    local_user = await get_user_by_id(user["id"])
    online_status = await get_user_online_status(user["id"])

    print(f"local_user: {local_user}")
    # 1. Prefer name from user_metadata
    name = (user.get("user_metadata", {}) or {}).get("name")

    # 2. If not present, fallback to local_user.name
    if not name and local_user:
        name = local_user.name  # not .get()

    # 3. If still missing, use email
    if not name:
        name = user.get("email")

    # 4. Final fallback
    name = (name or "").strip() or "unknown"

    # Email handling
    email = (user.get("email") or "").strip() or "unknown"

    return MeResponse(
        id=user["id"],
        email=email,
        role=user.get("user_metadata", {}).get("role", "unknown"),
        approved=approved,
        name=name,
        accepted_terms=terms,
        online_status=online_status,
        notify_offline = getattr(local_user, "notify_offline", False) if local_user else False,
    )
