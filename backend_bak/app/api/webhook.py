import logging
import hmac, hashlib

from fastapi import APIRouter, Request, HTTPException, Header, Query, Depends

from app.config import ENODE_WEBHOOK_SECRET
from app.storage.webhook import (
    get_webhook_logs,
    save_webhook_event,
    sync_webhook_subscriptions_from_enode,
    get_all_webhook_subscriptions,
)
from app.storage.vehicle_admin import save_vehicle_data_with_admin_client  # ✅ ny import
from app.enode import delete_webhook, subscribe_to_webhooks
from app.storage.webhook_subscriptions import mark_webhook_as_inactive, save_webhook_subscription
from app.auth.supabase_auth import get_supabase_user

router = APIRouter()


def verify_signature(raw_body: bytes, signature: str) -> bool:
    secret = ENODE_WEBHOOK_SECRET.encode()
    computed = hmac.new(secret, raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(computed, signature)
