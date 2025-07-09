from typing import Optional
from app.lib.supabase import get_supabase_admin_client

supabase = get_supabase_admin_client()

def get_global_stats_row() -> dict | None:
    result = (
        supabase
        .table("global_stats")
        .select("*")
        .eq("id", 1)
        .maybe_single()
        .execute()
    )
    return result.data