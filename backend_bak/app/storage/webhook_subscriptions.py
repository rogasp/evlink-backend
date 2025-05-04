from app.storage.db import supabase
from typing import Optional

async def get_all_webhooks():
    return supabase.table("webhook_subscriptions").select("*").order("created_at", desc=True).execute().data
