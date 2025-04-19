import os
import sqlite3
import json

import httpx
from fastapi import APIRouter, HTTPException, Query, Request, Body, Depends
from app.enode import (
    get_vehicle_data,
    create_link_session,
    get_link_result,
    subscribe_to_webhooks,
    get_access_token,
    get_vehicle_status, ENODE_BASE_URL, get_user_vehicles, get_linked_vendor_details
)
from app.security import require_api_key, require_local_request
from app.storage import (
    get_all_cached_vehicles,
    save_linked_vendor,
    DB_PATH,
    clear_webhook_events,
    create_api_key_for_user,
    list_all_api_keys, get_user, create_user
)

IS_DEV = os.getenv("ENV", "dev") == "dev"

router = APIRouter()

# ========================================
# 🔓 PUBLIC ENDPOINTS
# ========================================

@router.get("/ping")
async def ping():
    """Health check"""
    return {"message": "pong"}

@router.get("/public/user/{user_id}/apikey")
def get_api_key_for_login(user_id: str):
    """Public API key fetch (login) – can only be used to fetch your own key"""
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute("SELECT api_key FROM api_keys WHERE user_id = ?", (user_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="API key not found")
        return {"api_key": row[0]}


@router.get("/public/user/{user_id}")
def check_user_exists(user_id: str):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute(
            "SELECT 1 FROM api_keys WHERE user_id = ? LIMIT 1", (user_id,)
        )
        return {"exists": cursor.fetchone() is not None}

@router.post("/register")
async def register_user(payload: dict = Body(...)):
    user_id = payload.get("user_id")
    email = payload.get("email")

    if not user_id:
        raise HTTPException(status_code=400, detail="Missing user_id")

    create_user(user_id, email)
    return {"status": "created", "user_id": user_id}

@router.post("/confirm-link")
async def confirm_link(payload: dict = Body(...)):
    """Handles redirect from Enode – confirms vendor link"""
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


# ========================================
# 🔐 API KEY PROTECTED
# ========================================

@router.get("/user/{user_id}/vehicles")
async def list_user_vehicles(user_id: str = Depends(require_api_key)):
    """
    Returns a list of linked vehicles for the authenticated user.
    """
    try:
        return await get_user_vehicles(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}")
async def get_user_info(user_id: str = Depends(require_api_key)):
    try:
        vendors = await get_linked_vendor_details(user_id)  # 👈 Ny funktion i enode.py
        linked = [v["vendor"] for v in vendors if v.get("isValid")]
        return {"user_id": user_id, "linked_vendors": linked}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/vehicle/{vehicle_id}/status")
async def api_vehicle_status(
    vehicle_id: str,
    user_id: str = Depends(require_api_key),
    force: bool = Query(default=False, description="Force refresh from Enode")
):
    """Get current vehicle status (uses cache and/or Enode)"""
    try:
        vehicle = await get_vehicle_status(vehicle_id, force=force)
        return vehicle
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}/link")
async def link_vendor(
    user_id: str,
    vendor: str = Query(default=""),
    token_user_id: str = Depends(require_api_key)
):
    if user_id != token_user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    try:
        link = await create_link_session(user_id, vendor)
        return {
            "linkUrl": link.get("linkUrl"),
            "linkToken": link.get("linkToken")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/vehicles")
async def list_cached_vehicles(user_id: str = Depends(require_api_key)):
    """List all vehicles cached for the current user"""
    raw = get_all_cached_vehicles()
    return [json.loads(row) for row in raw]


@router.get("/vehicle/{vehicle_id}")
async def get_vehicle(vehicle_id: str, user_id: str = Depends(require_api_key)):
    """Get full cached vehicle object"""
    vehicle_data = await get_vehicle_data(vehicle_id)
    if not vehicle_data:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle_data


# ========================================
# 👮 ADMIN ONLY
# ========================================

@router.get("/admin/apikeys")
async def list_apikeys(user_id: str = Depends(require_api_key)):
    """List all API keys (admin only)"""
    if user_id != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return list_all_api_keys()


@router.get("/events")
async def list_webhook_events(user_id: str = Depends(require_api_key)):
    """List received webhook events (admin only)"""
    if user_id != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute("SELECT created_at, json FROM webhook_events ORDER BY created_at DESC")
        return [{"created_at": row[0], "data": json.loads(row[1])} for row in cursor.fetchall()]


# ========================================
# 🛠️ DEV TOOLS (OPTIONAL)
# ========================================

if IS_DEV:
    @router.post("/user/{user_id}/apikey")
    async def create_api_key(
            user_id: str,
            _: None = Depends(require_local_request)
    ):
        """Create an API key manually (for development)"""
        api_key = create_api_key_for_user(user_id)
        return {"user_id": user_id, "api_key": api_key}

    @router.get("/token")
    async def get_token(_: None = Depends(require_local_request)):
        """Get raw access token from Enode"""
        try:
            access_token = await get_access_token()
            return {"access_token": access_token}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @router.delete("/events")
    async def delete_all_events(_: None = Depends(require_local_request)):
        """Delete all stored webhook events (dev only)"""
        clear_webhook_events()
        return {"status": "ok", "message": "All webhook events deleted"}

    @router.post("/webhook/subscribe")
    async def webhook_subscribe(_: None = Depends(require_local_request)):
        """Subscribe to Enode webhook events"""
        try:
            result = await subscribe_to_webhooks()
            return {"status": "success", "result": result}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
