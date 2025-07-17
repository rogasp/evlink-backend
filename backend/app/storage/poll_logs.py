import logging
from datetime import datetime
from typing import Optional
from app.lib.supabase import get_supabase_admin_client

# Initialize Supabase admin client
supabase = get_supabase_admin_client()

async def log_poll(user_id: str, endpoint: str, timestamp: datetime, vehicle_id: Optional[str] = None) -> None:
    """
    Insert a new record into poll_logs when a user polls an endpoint.
    Optionally include the vehicle_id.
    """
    log_entry = {
        "user_id": user_id,
        "endpoint": endpoint,
        "created_at": timestamp.isoformat()
    }
    if vehicle_id:
        log_entry["vehicle_id"] = vehicle_id
        
    supabase.table("poll_logs").insert(log_entry).execute()

async def count_polls_since(user_id: str, since: datetime) -> int:
    """
    Count how many poll_logs entries exist for a user since the given datetime.
    Returns the exact count of rows.
    """
    resp = supabase \
        .table("poll_logs") \
        .select("id", count="exact") \
        .eq("user_id", user_id) \
        .gte("created_at", since.isoformat()) \
        .execute()
    return resp.count or 0

async def count_polls_since_for_vehicle(vehicle_id: str, since: datetime) -> int:
    """
    Count how many poll_logs entries exist for a specific vehicle since the given datetime.
    """
    resp = supabase \
        .table("poll_logs") \
        .select("id", count="exact") \
        .eq("vehicle_id", vehicle_id) \
        .gte("created_at", since.isoformat()) \
        .execute()
    return resp.count or 0

async def count_polls_in_period(user_id: str, start_time: datetime, end_time: datetime) -> int:
    """
    Count how many poll_logs entries exist for a user within a specific period.
    Returns the exact count of rows.
    """
    resp = supabase \
        .table("poll_logs") \
        .select("id", count="exact") \
        .eq("user_id", user_id) \
        .gte("created_at", start_time.isoformat()) \
        .lte("created_at", end_time.isoformat()) \
        .execute()
    return resp.count or 0
