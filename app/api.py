import httpx
from fastapi import APIRouter, HTTPException, Query, Request
from app.enode import get_vehicle_data, create_link_session, get_link_result
from app.storage import get_all_cached_vehicles, save_linked_vendor
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
        return {"linkUrl": link.get("linkUrl")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/link/callback")
async def link_callback(request: Request):
    link_token = request.query_params.get("token")
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