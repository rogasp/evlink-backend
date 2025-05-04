from datetime import datetime
from typing import Optional
from app.storage.db import supabase
from app.enode import fetch_enode_webhook_subscriptions


def save_webhook_event(payload: dict | list):
    """
    Save a webhook event with metadata like user_id, vehicle_id, and event type.
    """
    timestamp = datetime.utcnow().isoformat()

    try:
        parsed = payload[0] if isinstance(payload, list) else payload
        user_id = parsed.get("user", {}).get("id")
        vehicle_id = parsed.get("vehicle", {}).get("id")
        event = parsed.get("event")
        version = parsed.get("version")
    except Exception as e:
        print(f"⚠️  Failed to extract metadata from webhook payload: {e}")
        user_id = vehicle_id = event = version = None

    supabase.table("webhook_logs").insert({
        "created_at": timestamp,
        "payload": payload,
        "user_id": user_id,
        "vehicle_id": vehicle_id,
        "event": event,
        "event_type": event,  # keep both for now
        "version": version
    }).execute()

    print("✅ Webhook event saved")

def clear_webhook_events():
    supabase.table("webhook_logs").delete().neq("id", "").execute()
    print("🗑️  All webhook events deleted")

async def sync_webhook_subscriptions_from_enode():
    """
    Fetch current webhook subscriptions from Enode and upsert them to Supabase.
    """
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
                print(f"⚠️ No data returned on upsert for {item['id']} (status: {response.status_code})")
            else:
                print(f"✅ Upserted subscription {item['id']}")

        except Exception as e:
            print(f"❌ Exception while upserting {item['id']}: {e}")

def delete_webhook_subscription(enode_webhook_id: str):
    supabase.table("webhook_subscriptions").delete().eq("enode_webhook_id", enode_webhook_id).execute()

async def get_all_webhook_subscriptions():
    res = supabase.table("webhook_subscriptions") \
        .select("*") \
        .order("created_at", desc=True) \
        .execute()

    if hasattr(res, "error") and res.error:
        print(f"❌ Error fetching subscriptions from DB: {res.error}")
        return []

    return res.data or []
