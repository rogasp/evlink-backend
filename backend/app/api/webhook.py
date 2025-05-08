import json
from fastapi import APIRouter, Request, Header, HTTPException
import logging

from app.config import ENODE_WEBHOOK_SECRET  # se till att du har detta i .env
from app.lib.webhook_logic import process_event  # lagd i separat fil för logik
from app.enode.verify import verify_signature
from app.storage.webhook import save_webhook_event

router = APIRouter()

@router.post("/webhook/enode")
async def handle_webhook(
    request: Request,
    x_enode_signature: str = Header(None),
):
    try:
        raw_body = await request.body()

        # ✅ Kontrollera signaturen först
        if not verify_signature(raw_body, x_enode_signature):
            print("❌ Invalid signature – possible spoofed webhook")
            raise HTTPException(status_code=401, detail="Invalid signature")

        # ✅ Konvertera till JSON efter verifiering
        payload = json.loads(raw_body)
        print("[📥 Verified webhook payload]", payload)

        # ✅ Spara och processa
        save_webhook_event(payload)

        if isinstance(payload, list):
            handled = 0
            for event in payload:
                handled += await process_event(event)
            return {"status": "ok", "handled": handled}

        handled = await process_event(payload)
        return {"status": "ok", "handled": handled}

    except Exception as e:
        logging.exception("❌ Failed to handle webhook")
        raise HTTPException(status_code=400, detail=str(e))
