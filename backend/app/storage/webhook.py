# 📄 backend/app/storage/webhook.py

from typing import Optional
from app.enode import fetch_enode_webhook_subscriptions
from app.lib.supabase import get_supabase_admin_client

async def sync_webhook_subscriptions_from_enode():
    """
    Fetch current webhook subscriptions from Enode and upsert them to Supabase.
    """
    supabase = get_supabase_admin_client()

    print("[🔄] Fetching subscriptions from Enode")
    enode_subs = await fetch_enode_webhook_subscriptions()
    print(f"[ℹ️] Found {len(enode_subs)} subscriptions from Enode")

    for item in enode_subs:
        try:
            response = supabase.table("webhook_subscriptions").upsert({
                "enode_webhook_id": item["id"],
                "url": item["url"],
                "events": item.get("events", []),
                "is_active": item.get("isActive", False),
                "api_version": item.get("apiVersion"),
                "last_success": item.get("lastSuccess"),
                "created_at": item.get("createdAt"),
            }, on_conflict="enode_webhook_id").execute()

            if not response.data:
                print(f"⚠️ No data returned on upsert for {item['id']}")
            else:
                print(f"✅ Upserted subscription {item['id']}")

        except Exception as e:
            print(f"❌ Exception while upserting {item['id']}: {e}")


async def get_all_webhook_subscriptions():
    supabase = get_supabase_admin_client()

    try:
        result = supabase.table("webhook_subscriptions") \
            .select("*") \
            .order("created_at", desc=True) \
            .limit(100) \
            .execute()
        return result.data or []
    except Exception as e:
        print(f"[❌ get_all_webhook_subscriptions] {e}")
        return []

def get_webhook_logs(limit: int = 50, event_filter: Optional[str] = None) -> list[dict]:
    """
    Return a list of recent webhook logs, optionally filtered by event name.
    Uses admin Supabase client to bypass RLS.
    """
    supabase = get_supabase_admin_client()

    try:
        query = supabase \
            .table("webhook_logs") \
            .select("*") \
            .order("created_at", desc=True) \
            .limit(limit)

        if event_filter:
            print(f"[🔎 webhook_logs] Filtering by event: {event_filter}")
            query = query.eq("event", event_filter)

        res = query.execute()
        print(f"[✅ webhook_logs] Returned {len(res.data or [])} logs")
        return res.data or []
    except Exception as e:
        print(f"[❌ get_webhook_logs] {e}")
        return []