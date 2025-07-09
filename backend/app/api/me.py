# backend/app/api/me.py

from typing import Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.auth.supabase_auth import get_supabase_user
from app.storage.user import (
    create_onboarding_row,
    get_onboarding_status,
    get_user_accepted_terms,
    get_user_approved_status,
    get_user_by_id,
    get_user_online_status,
    is_subscriber,
    set_welcome_sent_if_needed,
)
from app.logger import logger
from app.services.brevo import add_or_update_brevo_contact
from app.storage.user import update_user


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
    tier: str
    sms_credits: int = 0
    stripe_customer_id: Optional[str] = None
    is_subscribed: bool  # NEW: whether the user is subscribed to the newsletter
    is_on_trial: bool # NEW: if the user is on a trial
    trial_ends_at: Optional[str] # NEW: when the trial ends

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

        # 2) Fetch local user row (basic user info)
        local_user = await get_user_by_id(user_id)
        logger.info(f"[ℹ️] local_user fetched: {local_user}")
        # 2b) Check onboarding status for welcome email
        email = user.get("email")
        name = (user.get("user_metadata") or {}).get("name", "unknown")

        try:
            onboarding = await get_onboarding_status(user_id)
            if not onboarding:
                onboarding = await create_onboarding_row(user_id)

            if onboarding and onboarding.get("welcome_sent") is False:
                await add_or_update_brevo_contact(email=email, first_name=name)
                await set_welcome_sent_if_needed(user_id)
        except Exception as e:
            logger.warning(f"[⚠️] Could not process welcome email for {email}: {e}")


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

        # 8) Determine is_subscribed using helper
        is_subscribed = await is_subscriber(user_id)

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
            tier=local_user.tier if local_user else "free",
            sms_credits=local_user.sms_credits if local_user else 0,
            stripe_customer_id=local_user.stripe_customer_id,
            is_subscribed=is_subscribed,  # NEW field
            is_on_trial=local_user.is_on_trial if local_user else False, # NEW field
            trial_ends_at=local_user.trial_ends_at if local_user else None # NEW field
        )

    except Exception as e:
        logger.error(f"[❌ get_me] Unexpected error: {e}")
        # If an error occurs while fetching, re-raise as appropriate (or customize)
        raise

@router.post("/me/activate-pro-trial")
async def activate_pro_trial(user=Depends(get_supabase_user)):
    user_id = user["id"]
    local_user = await get_user_by_id(user_id)

    if not local_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if user already has a paid subscription or has already had a trial
    if local_user.tier in ["pro", "basic"] or local_user.is_on_trial or local_user.trial_ends_at:
        raise HTTPException(status_code=400, detail="User is not eligible for a Pro trial.")

    # Calculate trial end date (30 days from now)
    trial_ends_at = datetime.now() + timedelta(days=30)

    # Update user in database
    await update_user(
        user_id=user_id,
        tier="pro",
        is_on_trial=True,
        trial_ends_at=trial_ends_at.isoformat() # Store as ISO format string
    )

    logger.info(f"[✅] User {user_id} activated Pro trial until {trial_ends_at}")
    return {"message": "Pro trial activated successfully", "trial_ends_at": trial_ends_at.isoformat()}
