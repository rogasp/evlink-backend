from fastapi import APIRouter, Depends, HTTPException, Query
from app.security import require_api_key
from app.enode import (
    get_vehicle_status,
    create_link_session,
    get_vehicle_data,
    get_user_vehicles,
)
from app.storage import save_linked_vendor

router = APIRouter()

@router.get("/vehicle/{vehicle_id}/status")
async def api_vehicle_status(
    vehicle_id: str,
    user_id: str = Depends(require_api_key),
    force: bool = Query(False)
):
    try:
        vehicle = await get_vehicle_status(vehicle_id, user_id=user_id, force=force)
        return {"vehicle_id": vehicle_id, "status": "ok"}
    except HTTPException as http_exc:
        raise http_exc  # 👈 bevara korrekt statuskod och meddelande
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}/link")
async def api_create_link_session(
    user_id: str,
    vendor: str = "",
    current_user: str = Depends(require_api_key)
):
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Unauthorized user")

    try:
        session = await create_link_session(user_id, vendor)
        save_linked_vendor(user_id, vendor)
        return session
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/vehicle/{vehicle_id}")
async def get_vehicle(
    vehicle_id: str,
    user_id: str = Depends(require_api_key)
):
    """
    Hämta detaljer om ett fordon – skyddad via API-nyckel.
    """
    vehicle_data = await get_vehicle_data(vehicle_id)
    if not vehicle_data:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if vehicle_data.get("userId") != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized vehicle access")

    return vehicle_data



@router.get("/vehicles")
async def list_cached_vehicles(user_id: str = Depends(require_api_key)):
    """
    Lista alla fordon från cachen – skyddad via API-nyckel.
    """
    from app.storage import get_all_cached_vehicles
    import json

    raw = get_all_cached_vehicles()
    return [json.loads(row) for row in raw]


@router.get("/user/{user_id}")
async def get_user_info(
    user_id: str,
    authed_user: str = Depends(require_api_key)
):
    """
    Hämta information om användaren och deras vendors.
    Endast användaren själv får anropa detta.
    """
    if user_id != authed_user:
        raise HTTPException(status_code=403, detail="Forbidden")

    from app.storage import get_user, get_linked_vendors
    user = get_user(user_id)
    vendors = get_linked_vendors(user_id)
    return {
        "user": user,
        "linkedVendors": vendors
    }


@router.get("/user/{user_id}/vehicles")
async def list_user_vehicles(
    user_id: str = Depends(require_api_key)
):
    """
    Hämta alla länkade fordon för den autentiserade användaren.
    """
    try:
        return await get_user_vehicles(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
