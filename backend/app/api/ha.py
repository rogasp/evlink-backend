import json
from fastapi import APIRouter, Depends, HTTPException
from app.auth.api_key_auth import get_api_key_user
from app.models.user import User
from app.storage.vehicle import get_vehicle_by_id


router = APIRouter()

@router.get("/status/{vehicle_id}/battery")
async def get_battery_status(vehicle_id: str, user: User = Depends(get_api_key_user)):
    print(f"[🔋 get_battery_status] Fetching battery status for vehicle_id: {vehicle_id}")
    print(f"[🔋 get_battery_status] User ID: {user.id}")

    vehicle = await get_vehicle_by_id(vehicle_id)
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if vehicle["user_id"] != user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        parsed_cache = json.loads(vehicle["vehicle_cache"])
        battery_level = parsed_cache.get("chargeState", {}).get("batteryLevel")
    except Exception as e:
        print("[❌ battery parse error]", e)
        battery_level = None

    return {"batteryLevel": battery_level}

@router.get("/status/{vehicle_id}")
async def get_vehicle_status(vehicle_id: str, user: User = Depends(get_api_key_user)):
    vehicle = await get_vehicle_by_id(vehicle_id)

    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if vehicle["user_id"] != user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        cache = json.loads(vehicle["vehicle_cache"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Invalid vehicle cache: {e}")

    charge = cache.get("chargeState", {})
    info = cache.get("information", {})
    location = cache.get("location", {})
    lastSeen = cache.get("lastSeen", {})
    isReachable = cache.get("isReachable")

    return {
        # 👇 legacy keys (to be removed later)
        "batteryLevel": charge.get("batteryLevel"),
        "range": charge.get("range"),
        "isCharging": charge.get("isCharging"),
        "isPluggedIn": charge.get("isPluggedIn"),
        "chargingState": charge.get("powerDeliveryState"),
        # 👇 old keys (to be used in Home Assistant)
        "vehicleName": f"{info.get('brand', '')} {info.get('model', '')}",
        "latitude": location.get("latitude"),
        "longitude": location.get("longitude"),
        "lastSeen": lastSeen,
        "isReachable": isReachable,

        # 👇 new full block for future Home Assistant sensors
        "chargeState": charge,
    }
