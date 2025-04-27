from fastapi import APIRouter, Request
from storage import save_webhook_event

router = APIRouter()

@router.post("/webhook")
async def handle_webhook(request: Request):
    payload = await request.json()

    # 🧠 Spara hela webhook-payloaden för spårbarhet
    save_webhook_event(payload)

    # 🔄 Hantera lista med events
    if isinstance(payload, list):
        for event in payload:
            event_type = event.get("event") or event.get("eventType")
            data = event.get("data")

            print(f"[WEBHOOK] Event: {event_type}")

            if event_type == "system:heartbeat":
                print("💓 Heartbeat mottagen")
                continue

            if event_type in ["user:vehicle:discovered", "user:vehicle:updated"]:
                if data:
                    save_vehicle_data(data)

        return {"status": "ok", "handled": len(payload)}

    # 🔄 Om payload är ett enskilt objekt (fallback)
    event_type = payload.get("event") or payload.get("eventType")
    data = payload.get("data")

    print(f"[WEBHOOK] Event: {event_type}")

    if event_type == "system:heartbeat":
        print("💓 Heartbeat mottagen")
        return {"status": "ok", "heartbeat": True}

    if event_type in ["user:vehicle:discovered", "user:vehicle:updated"]:
        if data:
            save_vehicle_data(data)

    return {"status": "ok"}
