# backend/app/api/webhook.py
from fastapi import APIRouter, Request, HTTPException, Header
from app.storage import get_webhook_logs, save_webhook_event, save_vehicle_data
import logging
from app.config import ENODE_WEBHOOK_SECRET
import hmac, hashlib

router = APIRouter()

def verify_signature(raw_body: bytes, signature: str) -> bool:
    secret = ENODE_WEBHOOK_SECRET.encode()
    computed = hmac.new(secret, raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(computed, signature)

@router.post("/webhook/enode")
async def handle_webhook(
    request: Request,
    x_signature: str = Header(None),  # valfritt: för signaturverifiering
):
    try:
        payload = await request.json()
        save_webhook_event(payload)  # 🔍 spårbarhet

        # ➕ Lägg till signaturverifiering här om vi vill
        # verify_signature(x_signature, payload)
        # raw_body = await request.body()
        # if not x_signature or not verify_signature(raw_body, x_signature):
        #     raise HTTPException(status_code=400, detail="Invalid signature")
        # payload = json.loads(raw_body)

        # ✅ Hantera lista med events
        if isinstance(payload, list):
            handled = 0
            for event in payload:
                handled += await process_event(event)
            return {"status": "ok", "handled": handled}

        # ✅ Hantera enskilt event
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
            print(f"⚠️ Saknar vehicle eller user_id i event: {event}")
            return 0

    # 🚫 Okänd eller irrelevant event
    print(f"⚠️ Unknown or unhandled event type: {event_type}")
    return 0


@router.get("/webhook/logs")
def fetch_webhook_logs():
    return get_webhook_logs()