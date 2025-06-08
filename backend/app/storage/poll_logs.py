# backend/app/storage/poll_logs.py

from datetime import datetime
from app.lib.supabase import get_supabase_admin_client

# Initialize Supabase admin client
supabase = get_supabase_admin_client()

async def log_poll(user_id: str, endpoint: str, timestamp: datetime) -> None:
    """
    Insert a new record into poll_logs when a user polls an endpoint.
    """
    supabase.table("poll_logs").insert({
        "user_id": user_id,
        "endpoint": endpoint,
        "created_at": timestamp.isoformat()
    }).execute()

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
    # The Supabase response will include `count` when using count="exact"
    return resp.count or 0
