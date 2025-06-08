# backend/app/api/dependencies.py

from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, Request

from app.auth.supabase_auth import get_supabase_user
from app.auth.api_key_auth import get_api_key_user
from app.storage.subscription import get_user_record
from app.storage.poll_logs import log_poll, count_polls_since
from app.storage.settings import get_setting_by_name

async def api_key_rate_limit(request: Request, user=Depends(get_api_key_user)) -> None:
    """
    Rate limit for API-key authenticated users, based on tier and settings table.
    """
    user_id = user.id
    record = await get_user_record(user_id)
    tier = record.get("tier", "free")

    # Load settings or use defaults
    free_max = free_window = pro_max = pro_window = None
    try:
        s = await get_setting_by_name("rate_limit.free.max_calls")
        free_max = int(s.get("value", 3))
        s = await get_setting_by_name("rate_limit.free.window_minutes")
        free_window = int(s.get("value", 30))
        s = await get_setting_by_name("rate_limit.pro.max_calls")
        pro_max = int(s.get("value", 2))
        s = await get_setting_by_name("rate_limit.pro.window_minutes")
        pro_window = int(s.get("value", 1))
    except Exception:
        free_max, free_window, pro_max, pro_window = 3, 30, 2, 1

    if tier == "free":
        max_calls, window = free_max, timedelta(minutes=free_window)
    else:
        max_calls, window = pro_max, timedelta(minutes=pro_window)

    now = datetime.utcnow()
    since = now - window
    count = await count_polls_since(user_id, since)
    if count >= max_calls:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded for {tier}: {count}/{max_calls} in last {window}."
        )
    await log_poll(user_id=user_id, endpoint=request.url.path, timestamp=now)

async def rate_limit_dependency(
    request: Request,
    user=Depends(get_supabase_user)
) -> None:
    """
    Rate limit for JWT-authenticated users, based on tier and settings table.
    """
    user_id = user["id"]
    record = await get_user_record(user_id)
    tier = record.get("tier", "free")

    # Load settings or use defaults
    free_max = free_window = pro_max = pro_window = None
    try:
        s = await get_setting_by_name("rate_limit.free.max_calls")
        free_max = int(s.get("value", 3))
        s = await get_setting_by_name("rate_limit.free.window_minutes")
        free_window = int(s.get("value", 30))
        s = await get_setting_by_name("rate_limit.pro.max_calls")
        pro_max = int(s.get("value", 2))
        s = await get_setting_by_name("rate_limit.pro.window_minutes")
        pro_window = int(s.get("value", 1))
    except Exception:
        free_max, free_window, pro_max, pro_window = 3, 30, 2, 1

    if tier == "free":
        max_calls, window = free_max, timedelta(minutes=free_window)
    else:
        max_calls, window = pro_max, timedelta(minutes=pro_window)

    now = datetime.utcnow()
    since = now - window
    count = await count_polls_since(user_id, since)
    if count >= max_calls:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded for {tier}: {count}/{max_calls} in last {window}."
        )
    await log_poll(user_id=user_id, endpoint=request.url.path, timestamp=now)
