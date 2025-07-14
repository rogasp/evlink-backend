"""FastAPI dependencies for rate limiting and subscription tier requirements."""

from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, Request, BackgroundTasks

from app.auth.supabase_auth import get_supabase_user
from app.auth.api_key_auth import get_api_key_user
# MODIFIED: Import more specific user functions
from app.storage.user import get_user_rate_limit_data, decrement_purchased_api_tokens
from app.storage.poll_logs import log_poll, count_polls_since, count_polls_since_for_vehicle
from app.storage.vehicles import get_vehicle_by_id_and_user_id
from app.storage.settings import get_setting_by_name

# TODO: This function can be removed once pydantic-settings is fully implemented.
async def _get_setting_value(setting_name: str, default_value: int) -> int:
    """Retrieves a setting value by name, with a fallback default."""
    s = await get_setting_by_name(setting_name)
    if s:
        return int(s.get("value", default_value))
    return default_value

# TODO: Define tier names (e.g., "free", "basic", "pro") as constants or an Enum.

async def api_key_rate_limit(
    request: Request,
    background_tasks: BackgroundTasks,
    user=Depends(get_api_key_user)
) -> None:
    """
    Rate limit for API-key authenticated users, based on a monthly tier allowance
    plus a balance of purchased one-time tokens.
    """
    user_id = user.id
    # MODIFIED: Fetch all required user data in one call
    record = await get_user_rate_limit_data(user_id)
    if not record:
        raise HTTPException(status_code=404, detail="User not found.")

    tier = record.get("tier", "free")
    linked_vehicle_count = record.get("linked_vehicle_count", 0)
    # NEW: Get purchased token balance
    purchased_api_tokens = record.get("purchased_api_tokens", 0)
    # NEW: Get the date when the monthly allowance resets
    tier_reset_date = record.get("tier_reset_date")

    now = datetime.now(timezone.utc)
    # MODIFIED: Use a monthly window based on the reset date
    if tier_reset_date and tier_reset_date > now:
        window_start = tier_reset_date - timedelta(days=30) # Approximate, cron will handle exact reset
    else:
        window_start = now - timedelta(days=30)


    max_calls = 0
    max_linked_vehicles = 0
    current_count = 0
    log_vehicle_id = None

    # Load settings dynamically
    free_max_calls = await _get_setting_value("rate_limit.free.max_calls", 300)
    basic_max_calls = await _get_setting_value("rate_limit.basic.max_calls", 2000)
    pro_max_calls = await _get_setting_value("rate_limit.pro.max_calls", 10000)
    basic_max_linked_vehicles = await _get_setting_value("rate_limit.basic.max_linked_vehicles", 2)
    pro_max_linked_vehicles = await _get_setting_value("rate_limit.pro.max_linked_vehicles", 5)

    path_vehicle_id = request.path_params.get("vehicle_id")

    if tier == "free":
        max_calls = free_max_calls
        current_count = await count_polls_since(user_id, window_start)
    elif tier in ["basic", "pro"]:
        if tier == "basic":
            max_calls = basic_max_calls
            max_linked_vehicles = basic_max_linked_vehicles
        else: # pro
            max_calls = pro_max_calls
            max_linked_vehicles = pro_max_linked_vehicles

        if not path_vehicle_id:
            raise HTTPException(status_code=400, detail=f"Vehicle ID is required in the URL path for {tier} tier.")

        vehicle = await get_vehicle_by_id_and_user_id(path_vehicle_id, user_id)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found or does not belong to user.")

        if linked_vehicle_count > max_linked_vehicles:
            raise HTTPException(status_code=403, detail=f"{tier.capitalize()} tier allows max {max_linked_vehicles} linked vehicles. You have {linked_vehicle_count}.")
        
        current_count = await count_polls_since_for_vehicle(path_vehicle_id, window_start)
        log_vehicle_id = path_vehicle_id
    else: # Default to free tier
        max_calls = free_max_calls
        current_count = await count_polls_since(user_id, window_start)

    # MODIFIED: Main rate limit logic with token fallback
    if current_count >= max_calls:
        if purchased_api_tokens > 0:
            # User has exhausted monthly allowance, but has purchased tokens.
            # Decrement token balance and allow the request.
            await decrement_purchased_api_tokens(user_id)
            # Log this as a token-based call for clarity, could add a flag to log_poll if needed
        else:
            # No monthly allowance and no purchased tokens left.
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded for {tier} tier. Monthly allowance ({current_count}/{max_calls}) and purchased tokens (0) are exhausted."
            )
    
    # Schedule logging as a background task
    background_tasks.add_task(log_poll, user_id=user_id, endpoint=request.url.path, timestamp=now, vehicle_id=log_vehicle_id)


async def require_pro_tier(user=Depends(get_api_key_user)) -> None:
    """
    Dependency to ensure the user has a 'pro' subscription tier.
    """
    user_id = user.id
    # MODIFIED: Use the more efficient data fetcher
    record = await get_user_rate_limit_data(user_id)
    tier = record.get("tier", "free") if record else "free"

    if tier != "pro":
        raise HTTPException(status_code=403, detail="This feature is only available for Pro users.")

async def require_basic_or_pro_tier(user=Depends(get_api_key_user)) -> None:
    """
    Dependency to ensure the user has a 'basic' or 'pro' subscription tier.
    """
    user_id = user.id
    # MODIFIED: Use the more efficient data fetcher
    record = await get_user_rate_limit_data(user_id)
    tier = record.get("tier", "free") if record else "free"

    if tier == "free":
        raise HTTPException(status_code=403, detail="This feature is not available for Free users.")

async def rate_limit_dependency(
    request: Request,
    user=Depends(get_supabase_user)
) -> None:
    """
    Rate limit for JWT-authenticated users, based on tier and settings table.
    This dependency remains unchanged for now, as it's for JWT users.
    """
    user_id = user["id"]
    record = await get_user_rate_limit_data(user_id)
    tier = record.get("tier", "free") if record else "free"

    # Load settings or use defaults
    free_max_s = await get_setting_by_name("rate_limit.free.max_calls")
    free_max = int(free_max_s.get("value", 3)) if free_max_s else 3

    free_window_s = await get_setting_by_name("rate_limit.free.window_minutes")
    free_window = int(free_window_s.get("value", 30)) if free_window_s else 30

    pro_max_s = await get_setting_by_name("rate_limit.pro.max_calls")
    pro_max = int(pro_max_s.get("value", 2)) if pro_max_s else 2

    pro_window_s = await get_setting_by_name("rate_limit.pro.window_minutes")
    pro_window = int(pro_window_s.get("value", 1)) if pro_window_s else 1

    if tier == "free":
        max_calls, window = free_max, timedelta(minutes=free_window)
    else:
        max_calls, window = pro_max, timedelta(minutes=pro_window)

    now = datetime.now(timezone.utc)
    since = now - window
    count = await count_polls_since(user_id, since)
    if count >= max_calls:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded for {tier}: {count}/{max_calls} in last {window}."
        )
    await log_poll(user_id=user_id, endpoint=request.url.path, timestamp=now)
