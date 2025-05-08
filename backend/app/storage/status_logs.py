from datetime import datetime
from app.lib.supabase import get_supabase_admin_client

supabase = get_supabase_admin_client()

async def log_status(category: str, status: bool, message: str = ""):
    """Store a status entry in the status_logs table."""
    payload = {
        "category": category,
        "status": status,
        "message": message,
        "checked_at": datetime.utcnow().isoformat()
    }

    try:
        result = supabase.table("status_logs").insert(payload).execute()
        print(f"[🟢] Status log saved: {category} - {status}")
    except Exception as e:
        print(f"[❌] Failed to log status: {e}")

async def get_recent_status_logs(category: str, limit: int = 24):
    result = supabase \
        .table("status_logs") \
        .select("*") \
        .eq("category", category) \
        .order("checked_at", desc=True) \
        .limit(limit) \
        .execute()

    return result.data or []
