# backend/app/api/webhook.py

import logging
import hmac, hashlib

from fastapi import APIRouter, Request, HTTPException, Header, Query

from app.config import ENODE_WEBHOOK_SECRET
from app.storage.webhook import get_webhook_logs, save_webhook_event
from app.storage.vehicle import save_vehicle_data

router = APIRouter()

def verify_signature(raw_body: bytes, signature: str) -> bool:
    secret = ENODE_WEBHOOK_SECRET.encode()
    computed = hmac.new(secret, raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(computed, signature)

@router.post("/webhook/enode")
async def handle_webhook(
    request: Request,
    x_signature: str = Header(None),
):
    try:
        payload = await request.json()
        save_webhook_event(payload)

        # ➕ Signaturverifiering kan aktiveras om önskat:
        # raw_body = await request.body()
        # if not x_signature or not verify_signature(raw_body, x_signature):
        #     raise HTTPException(status_code=400, detail="Invalid signature")
        # payload = json.loads(raw_body)

        if isinstance(payload, list):
            handled = 0
            for event in payload:
                handled += await process_event(event)
            return {"status": "ok", "handled": handled}

        await process_event(payload)
        return {"status": "ok"}

    except Exception as e:
        logging.exception("Failed to handle webhook")
        raise HTTPException(status_code=400, detail=str(e))

async def process_event(event: dict) -> int:
    event_type = event.get("event")
    print(f"[🔔 WEBHOOK] Event: {event_type}")

    if event_type == "system:heartbeat":
        print("💓 Heartbeat received")
        return 1

    if event_type in ["user:vehicle:discovered", "user:vehicle:updated"]:
        vehicle = event.get("vehicle")
        user = event.get("user", {})
        user_id = user.get("id")

        if vehicle and user_id:
            vehicle["userId"] = user_id
            save_vehicle_data(vehicle)
            return 1
        else:
            print(f"⚠️ Missing vehicle or user_id in event: {event}")
            return 0

    print(f"⚠️ Unknown or unhandled event type: {event_type}")
    return 0

@router.get("/webhook/logs")
def fetch_webhook_logs(
    event: str | None = Query(None),
    limit: int = Query(50, ge=1, le=1000)
):
    logs = get_webhook_logs(limit=limit, event_filter=event)
    print("[🐞 DEBUG] Webhook logs sample:", logs[:1])
    return logs
