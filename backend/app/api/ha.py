"""
backend/app/api/ha.py

Home Assistant API endpoints for EVLink backend.
"""
import json
import logging
from fastapi import APIRouter, Depends, HTTPException
from postgrest.exceptions import APIError
from app.auth.api_key_auth import get_api_key_user
from app.models.user import User
from app.storage.vehicle import get_vehicle_by_id

# Create a module-specific logger
logger = logging.getLogger(__name__)

router = APIRouter()

def _handle_api_error(e: APIError, vehicle_id: str, context: str):
    """
    Handle APIError from Supabase. Translate common error codes to HTTP responses.
    """
    payload = e.args[0]
    code = None
    message = str(payload)
    if isinstance(payload, dict):
        code = payload.get('code')
        message = payload.get('message', message)

    # Missing resource
    if code == '204' or 'Missing response' in message:
        logger.warning("[%s] Vehicle not found (APIError 204) for %s", context, vehicle_id)
        raise HTTPException(status_code=404, detail="Vehicle not found")
    # Invalid API key
    if code == '401' or 'Unauthorized' in message or 'invalid token' in message.lower():
        logger.warning("[%s] Unauthorized access for vehicle_id=%s: %s", context, vehicle_id, message)
        raise HTTPException(status_code=401, detail="Invalid API credentials")
    # Forbidden
    if code == '403' or 'Forbidden' in message or 'access denied' in message.lower():
        logger.warning("[%s] Access denied for vehicle_id=%s: %s", context, vehicle_id, message)
        raise HTTPException(status_code=403, detail="Access denied")

    # Other API errors
    logger.error("[%s] API error fetching vehicle %s: %s", context, vehicle_id, payload, exc_info=True)
    raise HTTPException(status_code=502, detail="Error fetching vehicle data")

@router.get("/status/{vehicle_id}/battery")
async def get_battery_status(vehicle_id: str, user: User = Depends(get_api_key_user)):
    logger.info("[get_battery_status] Fetching battery status for vehicle_id=%s, user_id=%s", vehicle_id, user.id)

    try:
        vehicle = await get_vehicle_by_id(vehicle_id)
    except APIError as e:
        _handle_api_error(e, vehicle_id, 'get_battery_status')
    except Exception as e:
        logger.error("[get_battery_status] Unexpected error fetching vehicle %s: %s", vehicle_id, e, exc_info=True)
        raise HTTPException(status_code=502, detail="Error fetching vehicle data")

    if not vehicle:
        logger.warning("[get_battery_status] Vehicle not found: %s", vehicle_id)
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if vehicle.get("user_id") != user.id:
        logger.warning("[get_battery_status] Access denied for user_id=%s on vehicle_id=%s", user.id, vehicle_id)
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        parsed_cache = json.loads(vehicle["vehicle_cache"])
        battery_level = parsed_cache.get("chargeState", {}).get("batteryLevel")
    except json.JSONDecodeError as e:
        logger.error("[get_battery_status] JSON decode error for vehicle_cache %s: %s", vehicle_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Corrupt vehicle cache")
    except Exception as e:
        logger.error("[get_battery_status] Unexpected error parsing battery level for %s: %s", vehicle_id, e, exc_info=True)
        battery_level = None

    return {"batteryLevel": battery_level}

@router.get("/status/{vehicle_id}")
async def get_vehicle_status(vehicle_id: str, user: User = Depends(get_api_key_user)):
    logger.info("[get_vehicle_status] Fetching full status for vehicle_id=%s, user_id=%s", vehicle_id, user.id)

    try:
        vehicle = await get_vehicle_by_id(vehicle_id)
    except APIError as e:
        _handle_api_error(e, vehicle_id, 'get_vehicle_status')
    except Exception as e:
        logger.error("[get_vehicle_status] Unexpected error fetching vehicle %s: %s", vehicle_id, e, exc_info=True)
        raise HTTPException(status_code=502, detail="Error fetching vehicle data")

    if not vehicle:
        logger.warning("[get_vehicle_status] Vehicle not found: %s", vehicle_id)
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if vehicle.get("user_id") != user.id:
        logger.warning("[get_vehicle_status] Access denied for user_id=%s on vehicle_id=%s", user.id, vehicle_id)
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        cache = json.loads(vehicle["vehicle_cache"])
    except json.JSONDecodeError as e:
        logger.error("[get_vehicle_status] JSON decode error for vehicle_cache %s: %s", vehicle_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Invalid vehicle cache: {e}")

    charge = cache.get("chargeState", {})
    info = cache.get("information", {})
    location = cache.get("location", {})
    last_seen = cache.get("lastSeen")
    is_reachable = cache.get("isReachable")

    return {
        # legacy keys (to be removed later)
        "batteryLevel": charge.get("batteryLevel"),
        "range": charge.get("range"),
        "isCharging": charge.get("isCharging"),
        "isPluggedIn": charge.get("isPluggedIn"),
        "chargingState": charge.get("powerDeliveryState"),
        # old keys (to be used in Home Assistant)
        "vehicleName": f"{info.get('brand', '')} {info.get('model', '')}",
        "latitude": location.get("latitude"),
        "longitude": location.get("longitude"),
        "lastSeen": last_seen,
        "isReachable": is_reachable,
        # new full block for future Home Assistant sensors
        "chargeState": charge,
    }
