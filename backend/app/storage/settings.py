# 📄 backend/app/storage/settings.py

from app.lib.supabase import get_supabase_admin_client

supabase = get_supabase_admin_client()

async def get_all_settings():
    try:
        res = supabase.table("settings").select("*").order("group_name").execute()
        return res.data or []
    except Exception as e:
        print(f"[❌ get_all_settings] {e}")
        return []
    
async def get_setting_by_name(name: str):
    try:
        res = supabase.table("settings").select("*").eq("name", name).maybe_single().execute()
        return res.data
    except Exception as e:
        print(f"[❌ get_setting_by_name] {e}")
        return None

async def add_setting(setting: dict):
    try:
        res = supabase.table("settings").insert(setting).execute()
        return res.data or []
    except Exception as e:
        print(f"[❌ add_setting] {e}")
        return []

async def update_setting(setting_id: str, setting: dict):
    try:
        res = supabase.table("settings").update(setting).eq("id", setting_id).execute()
        return res.data or []
    except Exception as e:
        print(f"[❌ update_setting] {e}")
        return []

async def delete_setting(setting_id: str):
    try:
        res = supabase.table("settings").delete().eq("id", setting_id).execute()
        return res.data or []
    except Exception as e:
        print(f"[❌ delete_setting] {e}")
        return []
