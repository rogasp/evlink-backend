from datetime import datetime
import logging

from app.lib.supabase import get_supabase_admin_client
from app.services.email_utils import send_offline_notification

logger = logging.getLogger(__name__)

async def handle_offline_notification_if_needed(vehicle_id: str, user_id: str, online_old: bool | None, online_new: bool):
    """Handles sending an offline notification if a vehicle's status changes from online to offline."""
    if online_old is True and online_new is False:
        logger.info(f"[🔔] Vehicle {vehicle_id} has gone OFFLINE")

        supabase = get_supabase_admin_client()
        user_result = supabase.table("users") \
            .select("email, notify_offline") \
            .eq("id", user_id) \
            .maybe_single() \
            .execute()
        user = user_result.data or {}

        if user.get("notify_offline") is True:
            email = user.get("email", "unknown")
            logger.info(f"[📧] Would send email to {email} about vehicle {vehicle_id}")
            await send_offline_notification(email=email, name=user.get("name", "User"), vehicle_name=vehicle_id)