# backend/app/api/ha.py

"""
Home Assistant API endpoints for EVLink backend.
"""
import json
import logging
from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel, Field
from postgrest.exceptions import APIError

from app.auth.api_key_auth import get_api_key_user
from app.models.user import User
from app.storage.vehicle import get_all_cached_vehicles, get_vehicle_by_id
from app.enode.vehicle import set_vehicle_charging
from app.api.dependencies import api_key_rate_limit, require_pro_tier, require_basic_or_pro_tier
from app.dependencies.auth import get_current_user
from app.storage.user import get_user_by_id 

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
        code = payload.get("code")
        message = payload.get("message", message)

    # Missing resource
    if code == "204" or "Missing response" in message:
        logger.warning("[%s] Vehicle not found (APIError 204) for %s", context, vehicle_id)
        raise HTTPException(status_code=404, detail="Vehicle not found")
    # Invalid API key
    if code == "401" or "Unauthorized" in message or "invalid token" in message.lower():
        logger.warning("[%s] Unauthorized access for vehicle_id=%s: %s", context, vehicle_id, message)
        raise HTTPException(status_code=401, detail="Invalid API credentials")
    # Forbidden
    if code == "403" or "Forbidden" in message or "access denied" in message.lower():
        logger.warning("[%s] Access denied for vehicle_id=%s: %s", context, vehicle_id, message)
        raise HTTPException(status_code=403, detail="Access denied")

    # Other API errors
    logger.error("[%s] API error fetching vehicle %s: %s", context, vehicle_id, payload, exc_info=True)
    raise HTTPException(status_code=502, detail="Error fetching vehicle data")

@router.get("/ha/me", 
            summary="Get current user information for Home Assistant",
            )
async def get_current_user_info(user: User = Depends(get_api_key_user)):
    """
    Endpoint to get the current user information for Home Assistant integration.
    Returns user ID and tier.
    """
    logger.info("[get_current_user_info] Fetching user info for user_id=%s", user.id)
    
    try:
        public_user = await get_user_by_id(user.id)
    except APIError as e:
        _handle_api_error(e, user.id, "get_current_user_info")
    except Exception as e:
        logger.error(
            "[get_current_user_info] Unexpected error fetching user %s: %s",
            user.id,
            e,
            exc_info=True,
        )
        raise HTTPException(status_code=502, detail="Error fetching user data")

    if not public_user:
        logger.warning("[get_current_user_info] User not found: %s", user.id)
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "user_id": public_user.id,
        "tier": public_user.tier,
        "email": public_user.email,
        "name": public_user.name,
        "role": public_user.role,
        "sms_credits": public_user.sms_credits,
    }


@router.get("/status/{vehicle_id}",
            dependencies=[Depends(api_key_rate_limit)],)
async def get_vehicle_status(vehicle_id: str, user: User = Depends(get_api_key_user)):
    logger.info(                                                                                                                                                                                                                                            
        "[get_vehicle_status] Fetching full status for vehicle_id=%s, user_id=%s",
        vehicle_id,
        user.id,
    )

    try:
        vehicle = await get_vehicle_by_id(vehicle_id)
    except APIError as e:
        _handle_api_error(e, vehicle_id, "get_vehicle_status")
    except Exception as e:
        logger.error(
            "[get_vehicle_status] Unexpected error fetching vehicle %s: %s",
            vehicle_id,
            e,
            exc_info=True,
        )
        raise HTTPException(status_code=502, detail="Error fetching vehicle data")

    if not vehicle:
        logger.warning("[get_vehicle_status] Vehicle not found: %s", vehicle_id)
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if vehicle.get("user_id") != user.id:
        logger.warning(
            "[get_vehicle_status] Access denied for user_id=%s on vehicle_id=%s",
            user.id,
            vehicle_id,
        )
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        cache = json.loads(vehicle["vehicle_cache"])
    except json.JSONDecodeError as e:
        logger.error(
            "[get_vehicle_status] JSON decode error for vehicle_cache %s: %s",
            vehicle_id,
            e,
            exc_info=True,
        )
        raise HTTPException(status_code=500, detail=f"Invalid vehicle cache: {e}")

    charge = cache.get("chargeState", {})
    info = cache.get("information", {})
    location = cache.get("location", {})
    last_seen = cache.get("lastSeen")
    is_reachable = cache.get("isReachable")
    odometer = cache.get("odometer", {})
    vendor = cache.get("vendor")
    smart_charging_policy = cache.get("smartChargingPolicy", {})

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
        "information": info,
        "location": location,
        "odometer": odometer,
        "vendor": vendor,
        "smartChargingPolicy": smart_charging_policy,
    }

@router.get("/ha/vehicles",
            dependencies=[Depends(api_key_rate_limit)],)
async def get_vehicles(user: User = Depends(get_api_key_user)):
    """
    Endpoint to get all vehicles for the current user.
    Returns a list of vehicle IDs and names.
    """
    logger.info("[get_vehicles] Fetching vehicles for user_id=%s", user.id)

    try:
        vehicles = get_all_cached_vehicles(user.id)
        logger.debug("[get_vehicles] Vehicles fetched: %s", vehicles)
    except APIError as e:
        _handle_api_error(e, user.id, "get_vehicles")
    except Exception as e:
        logger.error(
            "[get_vehicles] Unexpected error fetching vehicles for user %s: %s",
            user.id,
            e,
            exc_info=True,
        )
        raise HTTPException(status_code=502, detail="Error fetching vehicle data")

    if not vehicles:
        logger.warning("[get_vehicles] No vehicles found for user_id=%s", user.id)
        return []

    logger.debug("Raw vehicles: %r", vehicles)

    result = []
    for vehicle in vehicles:
        vehicle_id = vehicle.get("vehicle_id") or vehicle.get("id")
        if not vehicle_id:
            logger.warning("Vehicle saknar vehicle_id eller id: %r", vehicle)
            continue
        result.append(unpack_vehicle(vehicle, vehicle_id))
    return result
    

def unpack_vehicle(vehicle, vehicle_id):
    """
    Unpack vehicle data from the database format to a more usable format.
    """
    try:
        cache = json.loads(vehicle["vehicle_cache"])
    except json.JSONDecodeError as e:
        logger.error(
            "[get_vehicle_status] JSON decode error for vehicle_cache %s: %s",
            vehicle_id,
            e,
            exc_info=True,
        )
        raise HTTPException(status_code=500, detail=f"Invalid vehicle cache: {e}")

    charge = cache.get("chargeState", {})
    info = cache.get("information", {})
    location = cache.get("location", {})
    last_seen = cache.get("lastSeen")
    is_reachable = cache.get("isReachable")
    odometer = cache.get("odometer", {})
    vendor = cache.get("vendor")
    smart_charging_policy = cache.get("smartChargingPolicy", {})

    return {
        "vehicleId": vehicle_id,
        "vehicleName": f"{info.get('brand', '')} {info.get('model', '')}",
        "latitude": location.get("latitude"),
        "longitude": location.get("longitude"),
        "lastSeen": last_seen,
        "isReachable": is_reachable,
        # new full block for future Home Assistant sensors
        "chargeState": charge,
        "information": info,
        "location": location,
        "odometer": odometer,
        "vendor": vendor,
        "smartChargingPolicy": smart_charging_policy,
    }

@router.get("/ha/status/{vehicle_id}",
            dependencies=[Depends(api_key_rate_limit)],)
async def get_vehicle_status(vehicle_id: str, user: User = Depends(get_api_key_user)):
    logger.info(                                                                                                                                                                                                                                            
        "[get_vehicle_status] Fetching full status for vehicle_id=%s, user_id=%s",
        vehicle_id,
        user.id,
    )

    try:
        vehicle = await get_vehicle_by_id(vehicle_id)
    except APIError as e:
        _handle_api_error(e, vehicle_id, "get_vehicle_status")
    except Exception as e:
        logger.error(
            "[get_vehicle_status] Unexpected error fetching vehicle %s: %s",
            vehicle_id,
            e,
            exc_info=True,
        )
        raise HTTPException(status_code=502, detail="Error fetching vehicle data")

    if not vehicle:
        logger.warning("[get_vehicle_status] Vehicle not found: %s", vehicle_id)
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if vehicle.get("user_id") != user.id:
        logger.warning(
            "[get_vehicle_status] Access denied for user_id=%s on vehicle_id=%s",
            user.id,
            vehicle_id,
        )
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        cache = json.loads(vehicle["vehicle_cache"])
    except json.JSONDecodeError as e:
        logger.error(
            "[get_vehicle_status] JSON decode error for vehicle_cache %s: %s",
            vehicle_id,
            e,
            exc_info=True,
        )
        raise HTTPException(status_code=500, detail=f"Invalid vehicle cache: {e}")

    charge = cache.get("chargeState", {})
    info = cache.get("information", {})
    location = cache.get("location", {})
    last_seen = cache.get("lastSeen")
    is_reachable = cache.get("isReachable")
    odometer = cache.get("odometer", {})
    vendor = cache.get("vendor")
    smart_charging_policy = cache.get("smartChargingPolicy", {})
    capabilities = cache.get("capabilities", {})
    
    return {
        "vehicleName": f"{info.get('brand', '')} {info.get('model', '')}",
        "isReachable": is_reachable,
        "chargeState": charge,
        "information": info,
        "location": location,
        "odometer": odometer,
        "vendor": vendor,
        "smartChargingPolicy": smart_charging_policy,
        "capabilities": capabilities,
        "lastSeen": last_seen,
    }

# -------------------------------------------------------------------
# Pydantic model for charging action
# -------------------------------------------------------------------
class ChargingActionRequest(BaseModel):
    action: str = Field(
        ...,
        pattern="^(START|STOP)$",
        description="Must be 'START' or 'STOP'",
    )

    class Config:
        schema_extra = {
            "example": {
                "action": "START"
            }
        }


@router.post("/ha/charging/{vehicle_id}", 
            summary="Start or stop vehicle charging",
            dependencies=[Depends(api_key_rate_limit), Depends(require_basic_or_pro_tier)],
            )
async def post_vehicle_charging(
    vehicle_id: str,
    body: ChargingActionRequest = Body(...),
    user: User = Depends(get_api_key_user),
):
    """
    Endpoint to start or stop charging for a given vehicle. Expects JSON:
      { "action": "START" } or { "action": "STOP" }
    """
    action = body.action.upper()
    logger.info(
        "[post_vehicle_charging] Request to %s charging for vehicle_id=%s, user_id=%s",
        action,
        vehicle_id,
        user.id,
    )

    # 1) Fetch vehicle to verify ownership
    try:
        vehicle = await get_vehicle_by_id(vehicle_id)
    except APIError as e:
        _handle_api_error(e, vehicle_id, "post_vehicle_charging")
    except Exception as e:
        logger.error(
            "[post_vehicle_charging] Unexpected error fetching vehicle %s: %s",
            vehicle_id,
            e,
            exc_info=True,
        )
        raise HTTPException(status_code=502, detail="Error fetching vehicle data")

    if not vehicle:
        logger.warning("[post_vehicle_charging] Vehicle not found: %s", vehicle_id)
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if vehicle.get("user_id") != user.id:
        logger.warning(
            "[post_vehicle_charging] Access denied for user_id=%s on vehicle_id=%s",
            user.id,
            vehicle_id,
        )
        raise HTTPException(status_code=403, detail="Access denied")

    # 2) Extract Enode’s vehicle ID (stored as "vehicle_id" in the Supabase record)
    enode_vehicle_id = vehicle.get("vehicle_id")
    if not enode_vehicle_id:
        logger.error(
            "[post_vehicle_charging] Missing Enode vehicle_id for %s",
            vehicle_id,
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail="Vehicle does not have an associated Enode ID"
        )

    # 3) Call Enode to start/stop charging
    try:
        enode_response = await set_vehicle_charging(enode_vehicle_id, action)
        logger.info(
            "[post_vehicle_charging] Enode response for enode_vehicle_id=%s: %s",
            enode_vehicle_id,
            enode_response,
        )
    except HTTPException as e:
        # Om Enode returnerade 400/401/403/404 etc., skicka vidare samma
        raise
    except Exception as e:
        logger.error(
            "[post_vehicle_charging] Error calling Enode for enode_vehicle_id %s: %s",
            enode_vehicle_id,
            e,
            exc_info=True,
        )
        raise HTTPException(status_code=502, detail="Failed to trigger charging action")

    # 4) Return the Enode response (eller en enkel bekräftelse)
    return {
        "status": "success",
        "vehicle_id": vehicle_id,
        "enode_vehicle_id": enode_vehicle_id,
        "action": action,
        "enode_response": enode_response,
    }


