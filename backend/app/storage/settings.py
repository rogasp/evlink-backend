# 📄 backend/app/storage/settings.py

import logging
from app.lib.supabase import get_supabase_admin_client

logger = logging.getLogger(__name__)
supabase = get_supabase_admin_client()

async def get_all_settings():
    """Retrieves all application settings from the database."""
    try:
        res = supabase.table("settings").select("*").order("group_name").execute()
        return res.data or []
    except Exception as e:
        logger.error(f"[❌ get_all_settings] {e}")
        return []
    
async def get_setting_by_name(name: str):
    """Retrieves a single setting by its name."""
    try:
        res = supabase.table("settings").select("*").eq("name", name).maybe_single().execute()
        return res.data
    except Exception as e:
        logger.error(f"[❌ get_setting_by_name] {e}")
        return None

async def add_setting(setting: dict):
    """Adds a new setting to the database."""
    try:
        res = supabase.table("settings").insert(setting).execute()
        return res.data or []
    except Exception as e:
        logger.error(f"[❌ add_setting] {e}")
        return []

async def update_setting(setting_id: str, setting: dict):
    """Updates an existing setting in the database."""
    try:
        res = supabase.table("settings").update(setting).eq("id", setting_id).execute()
        return res.data or []
    except Exception as e:
        logger.error(f"[❌ update_setting] {e}")
        return []

async def delete_setting(setting_id: str):
    """Deletes a setting from the database."""
    try:
        res = supabase.table("settings").delete().eq("id", setting_id).execute()
        return res.data or []
    except Exception as e:
        logger.error(f"[❌ delete_setting] {e}")
        return []