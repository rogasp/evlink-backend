"""FastAPI dependencies for rate limiting and subscription tier requirements."""

from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, Request, BackgroundTasks

from app.auth.supabase_auth import get_supabase_user
from app.auth.api_key_auth import get_api_key_user
from app.storage.subscription import get_user_record
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
    Rate limit for API-key authenticated users, based on tier.
    """
    user_id = user.id
    record = await get_user_record(user_id)
    tier = record.get("tier", "free")
    linked_vehicle_count = record.get("linked_vehicle_count", 0)

    now = datetime.now(timezone.utc)
    window = timedelta(days=1) # All tiers are daily limits

    max_calls = 0
    max_linked_vehicles = 0
    current_count = 0
    log_vehicle_id = None

    # Load settings dynamically
    free_max_calls = await _get_setting_value("rate_limit.free.max_calls", 2)
    basic_max_calls = await _get_setting_value("rate_limit.basic.max_calls", 10)
    pro_max_calls = await _get_setting_value("rate_limit.pro.max_calls", 100)
    basic_max_linked_vehicles = await _get_setting_value("rate_limit.basic.max_linked_vehicles", 2)
    pro_max_linked_vehicles = await _get_setting_value("rate_limit.pro.max_linked_vehicles", 5)

    # Extract vehicle_id from path parameters if available
    path_vehicle_id = request.path_params.get("vehicle_id")

    if tier == "free":
        max_calls = free_max_calls
        current_count = await count_polls_since(user_id, now - window)
    elif tier == "basic":
        max_calls = basic_max_calls
        max_linked_vehicles = basic_max_linked_vehicles
        if not path_vehicle_id:
            raise HTTPException(status_code=400, detail="Vehicle ID is required in the URL path for Basic tier.")
        
        # Validate vehicle ownership
        vehicle = await get_vehicle_by_id_and_user_id(path_vehicle_id, user_id)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found or does not belong to user.")

        if linked_vehicle_count > max_linked_vehicles:
            raise HTTPException(status_code=403, detail=f"Basic tier allows max {max_linked_vehicles} linked vehicles. You have {linked_vehicle_count}.")
        current_count = await count_polls_since_for_vehicle(path_vehicle_id, now - window)
        log_vehicle_id = path_vehicle_id
    elif tier == "pro":
        max_calls = pro_max_calls
        max_linked_vehicles = pro_max_linked_vehicles
        if not path_vehicle_id:
            raise HTTPException(status_code=400, detail="Vehicle ID is required in the URL path for Pro tier.")

        # Validate vehicle ownership
        vehicle = await get_vehicle_by_id_and_user_id(path_vehicle_id, user_id)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found or does not belong to user.")

        if linked_vehicle_count > max_linked_vehicles:
            raise HTTPException(status_code=403, detail=f"Pro tier allows max {max_linked_vehicles} linked vehicles. You have {linked_vehicle_count}.")
        current_count = await count_polls_since_for_vehicle(path_vehicle_id, now - window)
        log_vehicle_id = path_vehicle_id
    else:
        # Default to free tier limits if tier is unknown
        max_calls = free_max_calls
        current_count = await count_polls_since(user_id, now - window)

    if current_count >= max_calls:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded for {tier} tier: {current_count}/{max_calls} calls in last 24 hours."
        )
    
    # Schedule logging as a background task
    background_tasks.add_task(log_poll, user_id=user_id, endpoint=request.url.path, timestamp=now, vehicle_id=log_vehicle_id)

async def require_pro_tier(user=Depends(get_api_key_user)) -> None:
    """
    Dependency to ensure the user has a 'pro' subscription tier.
    """
    user_id = user.id
    record = await get_user_record(user_id)
    tier = record.get("tier", "free")

    if tier != "pro":
        raise HTTPException(status_code=403, detail="This feature is only available for Pro users.")

async def require_basic_or_pro_tier(user=Depends(get_api_key_user)) -> None:
    """
    Dependency to ensure the user has a 'basic' or 'pro' subscription tier.
    """
    user_id = user.id
    record = await get_user_record(user_id)
    tier = record.get("tier", "free")

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
    record = await get_user_record(user_id)
    tier = record.get("tier", "free")

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