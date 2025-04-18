# app/webhook.py

from fastapi import APIRouter, Request, Header, HTTPException
from app.storage import cache_vehicle_data
import json

router = APIRouter()

@router.post("/webhook/enode")
async def receive_webhook(request: Request, authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")

    payload = await request.json()
    vehicle_id = payload.get("vehicleId")
    if not vehicle_id:
        raise HTTPException(status_code=400, detail="Missing vehicleId")

    cache_vehicle_data(vehicle_id, json.dumps(payload), payload.get("updated_at", ""))
    return {"status": "ok"}
