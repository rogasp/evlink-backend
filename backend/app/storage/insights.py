from typing import Optional
from app.lib.supabase import get_supabase_admin_client

supabase = get_supabase_admin_client()

def get_global_stats_row() -> dict | None:
    result = (
        supabase
        .table("charging_summary_view")
        .select("*")
        .maybe_single()
        .execute()
    )
    return result.data