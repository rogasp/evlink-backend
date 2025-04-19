import sqlite3

import httpx
from fastapi import APIRouter, HTTPException, Query, Request, Body
from app.enode import get_vehicle_data, create_link_session, get_link_result, subscribe_to_webhooks, get_access_token, get_vehicle_status
from app.storage import get_all_cached_vehicles, save_linked_vendor, DB_PATH, clear_webhook_events
import json

router = APIRouter()

@router.get("/vehicle/{vehicle_id}")
async def get_vehicle(vehicle_id: str):
    vehicle_data = await get_vehicle_data(vehicle_id)
    if not vehicle_data:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle_data

@router.get("/vehicles")
def list_cached_vehicles():
    raw = get_all_cached_vehicles()
    return [json.loads(row) for row in raw]

@router.get("/user/{user_id}/link")
async def link_vendor(user_id: str, vendor: str = Query(default="")):
    try:
        link = await create_link_session(user_id, vendor)
        return {
            "linkUrl": link.get("linkUrl"),
            "linkToken": link.get("linkToken")  # 👈 måste med!
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events")
def list_webhook_events():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute("SELECT created_at, json FROM webhook_events ORDER BY created_at DESC")
        return [{"created_at": row[0], "data": json.loads(row[1])} for row in cursor.fetchall()]


@router.post("/confirm-link")
async def confirm_link(payload: dict = Body(...)):
    link_token = payload.get("token")
    if not link_token:
        raise HTTPException(status_code=400, detail="Missing link token")

    try:
        link_info = await get_link_result(link_token)
        user_id = link_info.get("userId")
        vendor = link_info.get("vendor")

        if user_id and vendor:
            save_linked_vendor(user_id, vendor)

        return {
            "message": "Vendor successfully linked",
            "userId": user_id,
            "vendor": vendor
        }

    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Failed to verify link token: {str(e)}")

@router.post("/webhook/subscribe")
async def webhook_subscribe():
    try:
        result = await subscribe_to_webhooks()
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/token")
async def get_token():
    try:
        access_token = await get_access_token()
        return {"access_token": access_token}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/events")
def delete_all_events():
    clear_webhook_events()
    return {"status": "ok", "message": "All webhook events deleted"}

@router.get("/vehicle/{vehicle_id}/status")
async def api_vehicle_status(
    vehicle_id: str,
    force: bool = Query(default=False, description="Tvinga ny hämtning från Enode")
):
    try:
        vehicle = await get_vehicle_status(vehicle_id, force=force)
        return vehicle
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

