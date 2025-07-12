from collections import defaultdict
from datetime import datetime, timedelta
import logging
from app.lib.supabase import get_supabase_admin_client

logger = logging.getLogger(__name__)
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
        logger.info(f"[🟢] Status log saved: {category} - {status}")
    except Exception as e:
        logger.error(f"[❌] Failed to log status: {e}")

async def get_recent_status_logs(category: str, limit: int = 24):
    """Retrieves recent status logs for a given category."""
    result = supabase \
        .table("status_logs") \
        .select("*") \
        .eq("category", category) \
        .order("checked_at", desc=True) \
        .limit(limit) \
        .execute()

    return result.data or []

async def get_daily_status(category: str, from_date: datetime, to_date: datetime):
    """Aggregates status logs to provide a daily status summary for a given category and date range."""
    result = supabase.table("status_logs") \
        .select("status,checked_at") \
        .eq("category", category) \
        .gte("checked_at", from_date.isoformat()) \
        .lte("checked_at", to_date.isoformat()) \
        .order("checked_at", desc=False) \
        .limit(500) \
        .execute()

    logs = result.data or []
    logger.info(f"[🟢] Daily status logs fetched: {len(logs)} entries")
    per_day = defaultdict(list)

    for row in logs:
        date = row["checked_at"][:10]  # YYYY-MM-DD
        per_day[date].append(row["status"])

    output = []
    for day, statuses in sorted(per_day.items()):
        output.append({
            "date": day,
            "status": all(statuses)  # green only if all checks passed
        })

    return output


async def calculate_uptime(category: str, from_date: str, to_date: str) -> float:
    """Calculate uptime as % for a given category and date range."""
    try:
        result = supabase.table("status_logs") \
            .select("status, checked_at") \
            .gte("checked_at", from_date) \
            .lte("checked_at", to_date) \
            .eq("category", category) \
            .order("checked_at", desc=False) \
            .execute()

        logs = result.data or []
        if not logs:
            return 100.0  # No data = assume 100% uptime

        total_checks = len(logs)
        successful = sum(1 for log in logs if log["status"] is True)
        return round((successful / total_checks) * 100, 2)

    except Exception as e:
        logger.error(f"[❌] Failed to calculate uptime: {e}")
        return 0.0
    
async def get_status_panel_data(category: str, from_date: datetime, to_date: datetime):
    """Retrieves data formatted for a status panel, including daily status and uptime."""
    logs = await get_daily_status(category, from_date, to_date)
    uptime = await calculate_uptime(category, from_date, to_date)

    logger.info(f"[📊] Returning status panel data for {category} with {len(logs)} days and uptime {uptime}%")

    return [{
        "category": category,
        "uptime": uptime,
        "days": [
            {"date": row["date"], "ok": row["status"]}
            for row in logs
        ]
    }]