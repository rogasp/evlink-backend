from fastapi import APIRouter, Request, Header, HTTPException
import logging

from app.storage.webhook import save_webhook_event
from app.lib.webhook_logic import process_event  # lagd i separat fil för logik

router = APIRouter()

@router.post("/webhook/enode")
async def handle_webhook(
    request: Request,
    x_signature: str = Header(None),
):
    try:
        payload = await request.json()
        print("[📥 Incoming webhook payload]", payload)

        # Spara till DB
        save_webhook_event(payload)

        if isinstance(payload, list):
            handled = 0
            for event in payload:
                handled += await process_event(event)
            print(f"[✅ Processed batch] Total events handled: {handled}")
            return {"status": "ok", "handled": handled}

        handled = await process_event(payload)
        print(f"[✅ Processed single] Handled: {handled}")
        return {"status": "ok"}

    except Exception as e:
        logging.exception("❌ Failed to handle webhook")
        raise HTTPException(status_code=400, detail=str(e))
