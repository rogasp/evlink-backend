# backend/app/api/admin/webhooks.py
"""Admin endpoints for managing webhooks."""

import logging
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from app.auth.supabase_auth import get_supabase_user
from app.storage.webhook import (
    get_all_webhook_subscriptions,
    get_webhook_logs,
    mark_webhook_as_inactive,
    save_webhook_subscription,
    sync_webhook_subscriptions_from_enode,
)
from app.enode.webhook import subscribe_to_webhooks, delete_webhook
from app.storage.webhook_monitor import monitor_webhook_health

logger = logging.getLogger(__name__)

router = APIRouter()

# TODO: Add docstrings to all functions in this file.

def require_admin(user=Depends(get_supabase_user)):
    logger.info("🔍 Admin check - Full user object:")
    # logger.info(user)

    role = user.get("user_metadata", {}).get("role")
    logger.info(f"🔐 Extracted role: {role}")

    if role != "admin":
        logger.warning(f"⛔ Access denied: user {user['id']} with role '{role}' tried to access admin route")
        raise HTTPException(status_code=403, detail="Admin access required")

    logger.info(f"✅ Admin access granted to user {user['id']}")
    return user

@router.get("/webhook/subscriptions")
async def list_enode_webhooks(user=Depends(require_admin)):
    try:
        logger.info("[🔄] Syncing subscriptions from Enode → Supabase...")
        await sync_webhook_subscriptions_from_enode()
        result = await get_all_webhook_subscriptions()
        logger.info(f"[✅] Returning {len(result)} subscriptions")
        return result
    except Exception as e:
        logger.error(f"[❌ ERROR] {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/webhook/logs")
def fetch_webhook_logs(
    event: str | None = Query(None),
    user_q: str | None = Query(None),
    vehicle_q: str | None = Query(None),
    limit: int = Query(50, ge=1, le=1000),
    user=Depends(require_admin),
):
    try:
        logger.info(f"[🔍] Fetching webhook logs with filters: event={event}, user={user_q}, vehicle={vehicle_q}, limit={limit}")
        logs = get_webhook_logs(
            limit=limit,
            event_filter=event,
            user_filter=user_q,
            vehicle_filter=vehicle_q,
        )
        logger.debug("[🐞 DEBUG] Webhook logs sample:", logs[:1])
        return logs
    except Exception as e:
        logger.error(f"[❌ fetch_webhook_logs] {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve webhook logs")

@router.post("/webhook/subscriptions")
async def create_enode_webhook(user=Depends(require_admin)):
    try:
        response = await subscribe_to_webhooks()
        await save_webhook_subscription(response)
        return response
    except Exception as e:
        logger.error(f"[❌ create_enode_webhook] {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/webhook/subscriptions/{webhook_id}")
async def delete_enode_webhook(webhook_id: str, user=Depends(require_admin)):
    try:
        await mark_webhook_as_inactive(webhook_id)
        await delete_webhook(webhook_id)
        return {"deleted": True}
    except Exception as e:
        logger.error(f"[❌ delete_enode_webhook] {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/webhook/monitor")
async def run_webhook_monitor(user=Depends(require_admin)):
    """
    Run webhook health monitoring manually (sync + check + auto test).
    """
    await monitor_webhook_health()
    return {"status": "completed"}
