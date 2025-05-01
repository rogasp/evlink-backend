# backend/app/storage/webhook.py

from datetime import datetime
from typing import Optional
import json
from app.storage.db import supabase

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

def get_webhook_logs(limit: int = 50, event_filter: Optional[str] = None) -> list[dict]:
    """
    Retrieve the latest webhook logs, optionally filtered by event type.
    """
    query = supabase.table("webhook_logs").select("*").order("created_at", desc=True).limit(limit)
    
    if event_filter:
        query = query.eq("event", event_filter)
    
    res = query.execute()
    return res.data or []

def clear_webhook_events():
    """
    Delete all webhook logs. Use with caution!
    """
    supabase.table("webhook_logs").delete().neq("id", "").execute()
    print("🗑️  All webhook events deleted")
