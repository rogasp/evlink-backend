from app.storage.db import supabase
from typing import Optional

async def save_webhook_subscription(enode_response: dict):
    data = {
        "enode_webhook_id": enode_response["id"],
        "url": enode_response["url"],
        "events": enode_response["events"],
        "secret": None,  # Av säkerhetsskäl kan du välja att inte spara secret
        "api_version": enode_response.get("apiVersion"),
        "is_active": enode_response.get("isActive", True),
        "last_success": enode_response.get("lastSuccess"),
        "authentication": enode_response.get("authentication")
    }
    return supabase.table("webhook_subscriptions").upsert(data, on_conflict=["enode_webhook_id"]).execute()

async def mark_webhook_as_inactive(enode_webhook_id: str):
    return supabase.table("webhook_subscriptions").update({
        "is_active": False,
        "ended_at": "now()"
    }).eq("enode_webhook_id", enode_webhook_id).execute()

async def get_all_webhooks():
    return supabase.table("webhook_subscriptions").select("*").order("created_at", desc=True).execute().data
