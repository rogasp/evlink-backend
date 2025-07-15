# backend/app/api/me.py

from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth.supabase_auth import get_supabase_user
from app.logger import logger
from app.services.brevo import add_or_update_brevo_contact
from app.storage.poll_logs import count_polls_since
from app.storage.settings import get_setting_by_name
from app.storage.subscription import get_user_record
from app.storage.user import (
    create_onboarding_row,
    get_onboarding_status,
    get_user_accepted_terms,
    get_user_approved_status,
    get_user_by_id,
    get_user_online_status,
    is_subscriber,
    set_welcome_sent_if_needed,
    update_user,
)


router = APIRouter()


class MeResponse(BaseModel):
    """
    Response model for GET /me, now including 'is_subscribed'.
    """

    id: str
    email: str
    role: str
    is_approved: bool
    name: str
    accepted_terms: bool
    online_status: str  # "red", "yellow", "green", "grey"
    notify_offline: bool
    tier: str
    sms_credits: int = 0
    purchased_api_tokens: int = 0 # NEW: User's balance of purchased API tokens
    stripe_customer_id: Optional[str] = None
    is_subscribed: bool  # NEW: whether the user is subscribed to the newsletter
    is_on_trial: bool  # NEW: if the user is on a trial
    trial_ends_at: Optional[str]  # NEW: when the trial ends


class ApiUsageStatsResponse(BaseModel):
    current_calls: int
    max_calls: int
    max_linked_vehicles: int
    linked_vehicle_count: int
    tier: str


async def _get_setting_value(setting_name: str, default_value: int) -> int:
    try:
        s = await get_setting_by_name(setting_name)
        return int(s.get("value", default_value))
    except Exception:
        return default_value


@router.get("/me/api-usage", response_model=ApiUsageStatsResponse)
async def get_api_usage_stats(user=Depends(get_supabase_user)):
    """
    Retrieves API usage statistics for the current user based on their subscription tier.
    """
    user_id = user["id"]
    record = await get_user_record(user_id)
    tier = record.get("tier", "free")
    linked_vehicle_count = record.get("linked_vehicle_count", 0)

    # Define tier configurations
    tier_configs = {
        "free": {
            "max_calls_setting": "rate_limit.free.max_calls",
            "max_calls_default": 2,
            "max_linked_vehicles_setting": None,
            "max_linked_vehicles_default": 0,
        },
        "basic": {
            "max_calls_setting": "rate_limit.basic.max_calls",
            "max_calls_default": 10,
            "max_linked_vehicles_setting": "rate_limit.basic.max_linked_vehicles",
            "max_linked_vehicles_default": 2,
        },
        "pro": {
            "max_calls_setting": "rate_limit.pro.max_calls",
            "max_calls_default": 100,
            "max_linked_vehicles_setting": "rate_limit.pro.max_linked_vehicles",
            "max_linked_vehicles_default": 5,
        },
    }

    # Get config for the user's tier, defaulting to 'free'
    config = tier_configs.get(tier, tier_configs["free"])

    # Load settings dynamically based on config
    max_calls = await _get_setting_value(
        config["max_calls_setting"], config["max_calls_default"]
    )
    max_linked_vehicles = (
        await _get_setting_value(
            config["max_linked_vehicles_setting"],
            config["max_linked_vehicles_default"],
        )
        if config["max_linked_vehicles_setting"]
        else config["max_linked_vehicles_default"]
    )

    # Calculate current calls
    # TODO(#151): This is a simplification for basic/pro. It should sum calls across all linked vehicles.
    # This will be addressed in a separate task.
    now = datetime.utcnow()
    window = timedelta(days=1)  # All tiers have daily limits
    current_calls = await count_polls_since(user_id, now - window)

    return ApiUsageStatsResponse(
        current_calls=current_calls,
        max_calls=max_calls,
        max_linked_vehicles=max_linked_vehicles,
        linked_vehicle_count=linked_vehicle_count,
        tier=tier,
    )


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
        notify_offline = (
            getattr(local_user, "notify_offline", False) if local_user else False
        )

        # 8) Determine is_subscribed using helper
        is_subscribed = await is_subscriber(user_id)

        # 9) Return the assembled response
        return MeResponse(
            id=user_id,
            email=email,
            role=role,
            is_approved=approved,
            name=name,
            accepted_terms=terms,
            online_status=online_status,
            notify_offline=notify_offline,
            tier=local_user.tier if local_user else "free",
            sms_credits=local_user.sms_credits if local_user else 0,
            purchased_api_tokens=local_user.purchased_api_tokens if local_user else 0, # NEW field
            stripe_customer_id=local_user.stripe_customer_id,
            is_subscribed=is_subscribed,  # NEW field
            is_on_trial=local_user.is_on_trial if local_user else False,  # NEW field
            trial_ends_at=local_user.trial_ends_at
            if local_user
            else None,  # NEW field
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
    if (
        local_user.tier in ["pro", "basic"]
        or local_user.is_on_trial
        or local_user.trial_ends_at
    ):
        raise HTTPException(
            status_code=400, detail="User is not eligible for a Pro trial."
        )

    # Calculate trial end date (30 days from now)
    trial_ends_at = datetime.now() + timedelta(days=30)

    # Update user in database
    await update_user(
        user_id=user_id,
        tier="pro",
        is_on_trial=True,
        trial_ends_at=trial_ends_at.isoformat(),  # Store as ISO format string
    )

    logger.info(f"[✅] User {user_id} activated Pro trial until {trial_ends_at}")
    return {
        "message": "Pro trial activated successfully",
        "trial_ends_at": trial_ends_at.isoformat(),
    }