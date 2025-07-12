from typing import Optional
from app.lib.supabase import get_supabase_admin_client
from postgrest.exceptions import APIError

supabase = get_supabase_admin_client()

def get_global_stats_row() -> dict | None:
    result = (
        supabase
        .table("global_stats_view")
        .select("*")
        .maybe_single()
        .execute()
    )
    return result.data

def get_user_stats_row(user_id: str) -> dict | None:
    """Retrieves user-specific statistics by calling the 'get_user_stats' RPC function."""
    try:
        result = (
            supabase
            .rpc('get_user_stats', {'p_user_id': user_id})
            .execute()
        )
        if result.data:
            return result.data[0] # RPC function returns a list of records
        return None
    except APIError as e:
        if e.code == '204': # No Content
            return None
        raise e