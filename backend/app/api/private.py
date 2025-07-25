# 📄 backend/app/api/private.py

from fastapi import APIRouter, Body, Depends, HTTPException, Path, Query
from datetime import datetime, timezone, timedelta

from pydantic import BaseModel
from app.auth.supabase_auth import get_supabase_user
from app.enode.link import create_link_session
from app.enode.user import get_user_vehicles_enode, unlink_vendor
from app.storage.api_key import create_api_key, get_api_key_info
from app.storage.insights import get_global_stats_row, get_user_stats_row
from app.storage.invoice import get_user_invoices
from app.storage.subscription import get_user_record, get_user_subscription
from app.storage.user import get_ha_webhook_settings, get_onboarding_status, set_ha_webhook_settings, update_notify_offline, update_user_terms
from app.api.dependencies import require_pro_tier
from app.storage.vehicle import get_all_cached_vehicles, get_vehicle_by_vehicle_id, save_vehicle_data_with_client

import json
import logging



# Create a module-specific logger
logger = logging.getLogger(__name__)

router = APIRouter()

CACHE_EXPIRATION_MINUTES = 5

class LinkVehicleRequest(BaseModel):
    vendor: str

class LinkVehicleResponse(BaseModel):
    url: str
    linkToken: str

class UnlinkRequest(BaseModel):
    vendor: str

class GetUserVehicleByVehIdResponse(BaseModel):
    id: str

class UpdateNotifyRequest(BaseModel):
    notify_offline: bool

class SubscriptionStatusResponse(BaseModel):
    tier: str
    linked_vehicle_count: int
    subscription_status: str

@router.get("/user/vehicles", response_model=list)
async def get_user_vehicles(user=Depends(get_supabase_user)):
    """Fetches all vehicles linked to the current user, utilizing a cache."""
    user_id = user["id"]
    now = datetime.now(timezone.utc)

    logger.info(f"🔐 Authenticated user: {user_id} ({user['email']})")

    cached_data = get_all_cached_vehicles(user_id)
    logger.debug(f"[DEBUG] cached_data: {cached_data}")
    vehicles_from_cache = []

    if cached_data:
        try:
            updated_at = datetime.fromisoformat(cached_data[0]["updated_at"])
            logger.debug(f"[DEBUG] now: {now}")
            logger.debug(f"[DEBUG] updated_at: {updated_at}")
            logger.debug(f"[DEBUG] now - updated_at: {now - updated_at}")
            logger.debug(f"[DEBUG] threshold: {timedelta(minutes=CACHE_EXPIRATION_MINUTES)}")
            if now - updated_at < timedelta(minutes=CACHE_EXPIRATION_MINUTES):
                for row in cached_data:
                    vehicle_obj = json.loads(row["vehicle_cache"]) if isinstance(row["vehicle_cache"], str) else row["vehicle_cache"]
                    vehicle_obj["db_id"] = row["id"]
                    vehicles_from_cache.append(vehicle_obj)
                logger.info(f"✅ Serving {len(vehicles_from_cache)} vehicles from cache")
                return vehicles_from_cache
            else:
                logger.info("ℹ️ Cache expired")
        except Exception as e:
            logger.warning(f"[⚠️ cache] Failed to parse updated_at: {e}")

    try:
        fresh_vehicles = await get_user_vehicles_enode(user_id)
        logger.info(f"🔄 Fetched {len(fresh_vehicles)} fresh vehicle(s) from Enode")

        for vehicle in fresh_vehicles:
            vehicle["userId"] = user_id
            await save_vehicle_data_with_client(vehicle)

        logger.info(f"💾 Saved {len(fresh_vehicles)} vehicle(s) to Supabase")

        # Fetch the cache again and return from the newly populated cache
        cached_data = get_all_cached_vehicles(user_id)
        logger.debug(f"[DEBUG] post-save cached_data: {cached_data}")
        vehicles_from_cache = []
        for row in cached_data:
            vehicle_obj = json.loads(row["vehicle_cache"]) if isinstance(row["vehicle_cache"], str) else row["vehicle_cache"]
            vehicle_obj["db_id"] = row["id"]
            vehicles_from_cache.append(vehicle_obj)
        logger.info(f"✅ Returning {len(vehicles_from_cache)} vehicles (after fresh fetch)")
        return vehicles_from_cache

    except Exception as e:
        logger.error(f"[❌ fetch_fresh] Failed to fetch or save vehicles: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch vehicles")

@router.get("/vehicle/by_vid")
async def get_vehicle_by_vid(
    vehicle_id: str = Query(..., alias="vehicle_id"),
    user=Depends(get_supabase_user)
):
    """Retrieves a specific vehicle by its Enode vehicle ID (vid)."""
    logger.info(f"🔐 Authenticated user: {user['id']} ({user['email']})")
    try:
        vehicle = await get_vehicle_by_vehicle_id(vehicle_id)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")

        if vehicle["user_id"] != user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to access this vehicle")

        return vehicle
    except Exception as e:
        logger.error(f"[❌ vehicle_by_vid] Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve vehicle")

@router.post("/users/{user_id}/apikey")
async def create_user_api_key(user_id: str = Path(...), user=Depends(get_supabase_user)):
    """Creates a new API key for the specified user."""
    if user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to create API key for another user")

    logger.info(f"🔑 Creating API key for user: {user_id}")
    raw_key = create_api_key(user_id)
    logger.info(f"✅ API key created for user: {user_id}")
    return {"api_key": raw_key}

@router.get("/users/{user_id}/apikey")
async def get_user_api_key_info(user_id: str = Path(...), user=Depends(get_supabase_user)):
    """Retrieves information about the API key for the specified user."""
    if user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view API key for another user")

    logger.info(f"🔍 Looking up API key for user: {user_id}")
    info = get_api_key_info(user_id)

    if info:
        logger.info(f"✅ Found API key created at: {info['created_at']}")
        return {
            "api_key_masked": "***************",
            "created_at": info["created_at"]
        }
    else:
        logger.warning(f"⚠️ No API key found for user: {user_id}")
        return {"api_key_masked": None}

@router.post("/user/link-vehicle", response_model=LinkVehicleResponse)
async def api_create_link_session(
    request: LinkVehicleRequest,
    user=Depends(get_supabase_user),
):
    """Create a linking session for a vehicle vendor via Enode v3."""
    try:
        user_id = user["id"]
        logger.info(f"🔗 Creating link session for user {user_id} and vendor {request.vendor}")

        session = await create_link_session(user_id=user_id, vendor=request.vendor)

        link_url = session.get("linkUrl")
        link_token = session.get("linkToken")

        if not link_url or not link_token:
            logger.error(f"❌ Invalid session response from Enode: {session}")
            raise HTTPException(status_code=500, detail="Missing 'linkUrl' or 'linkToken' in Enode response")

        logger.info(f"✅ Link session created for {user_id}: {link_url}")
        return LinkVehicleResponse(
            url=link_url,
            linkToken=link_token
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[❌ ERROR] Failed to create link session: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create link session: {str(e)}")

@router.post("/user/unlink")
async def unlink_vendor_route(payload: UnlinkRequest, user=Depends(get_supabase_user)):
    """Unlinks a vehicle vendor for the current user."""
    user_id = user["id"]

    success, error = await unlink_vendor(user_id=user_id, vendor=payload.vendor)

    if not success:
        raise HTTPException(status_code=500, detail=f"Unlink failed: {error}")

    return {"success": True, "message": f"Vendor {payload.vendor} unlinked"}

@router.patch("/user/{user_id}")
async def patch_user_terms(user_id: str, payload: dict, user=Depends(get_supabase_user)):
    """Updates the terms and conditions acceptance status for a user."""
    if user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this user.")

    accepted = payload.get("accepted_terms")
    if not isinstance(accepted, bool):
        raise HTTPException(status_code=400, detail="accepted_terms must be a boolean")

    await update_user_terms(user_id=user_id, accepted_terms=accepted)
    return {"status": "ok"}

@router.patch("/user/{user_id}/notify")
async def update_notify(user_id: str, payload: UpdateNotifyRequest, user=Depends(get_supabase_user)):
    """Updates the notification preference for when a vehicle goes offline."""
    if user["id"] != user_id:
        raise HTTPException(status_code=403, detail="You can only modify your own settings.")

    await update_notify_offline(user_id, payload.notify_offline)
    return {"status": "ok"}

@router.get("/user/subscription-status", response_model=SubscriptionStatusResponse)
async def user_subscription_status(user=Depends(get_supabase_user)):
    """Returns the current user's subscription tier and status."""
    user_id = user["id"]
    record = await get_user_record(user_id)
    return SubscriptionStatusResponse(
        tier=record.get("tier", "free"),
        linked_vehicle_count=record.get("linked_vehicle_count", 0),
        subscription_status=record.get("subscription_status", ""),
    )

@router.get("/user/{user_id}/onboarding")
async def get_user_onboarding_status(
    user_id: str = Path(...),
    user=Depends(get_supabase_user)
):
    """Retrieves the onboarding status for the specified user."""
    if user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    logger.info(f"🔍 Fetching onboarding status for user: {user_id}")
    status = await get_onboarding_status(user_id)

    if status:
        return status
    else:
        logger.warning(f"⚠️ No onboarding data found for user {user_id}")
        return {"status": "not_started"}

@router.get("/user/{user_id}/webhook")
async def api_get_webhook(user_id: str, user=Depends(get_supabase_user)):
    """Gets the Home Assistant webhook settings for a user."""
    if user["id"] != user_id and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not allowed")
    webhook = get_ha_webhook_settings(user_id)
    if webhook is None:
        raise HTTPException(status_code=404, detail="Webhook not found")
    return webhook

@router.patch("/user/{user_id}/webhook")
async def api_patch_webhook(
    user_id: str,
    body: dict = Body(...),
    user=Depends(get_supabase_user)
):
    """Creates or updates the Home Assistant webhook settings for a user."""
    if user["id"] != user_id and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not allowed")
    url = body.get("webhook_url")
    webhook_id = body.get("webhook_id")
    if url is None or webhook_id is None:
        raise HTTPException(status_code=400, detail="Missing webhook_url or webhook_id")
    updated = set_ha_webhook_settings(user_id, url, webhook_id)
    return updated

@router.get("/user/{user_id}/subscription")
async def api_get_user_subscription(
    user_id: str,
    user=Depends(get_supabase_user)
):
    """Retrieves subscription details for a specific user."""
    # Allow access only for the user themselves or an admin.
    if user["id"] != user_id and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    sub = await get_user_subscription(user_id)
    if not sub:
        return None
    return sub

@router.get("/user/{user_id}/invoices")
async def api_get_user_invoices(
    user_id: str,
    user=Depends(get_supabase_user)
):
    """Retrieves a list of invoices for a specific user."""
    # Allow access only for the user themselves or an admin.
    if user["id"] != user_id and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    invoices = await get_user_invoices(user_id)
    return invoices or []

@router.get("/stats/global")
async def get_global_stats():
    """Retrieves global, system-wide statistics."""
    row = get_global_stats_row()
    if not row:
        raise HTTPException(status_code=404, detail="No global stats found")
    return row

@router.get("/stats/user")
async def get_user_stats(user=Depends(get_supabase_user)):
    """Retrieves statistics for the current authenticated user."""
    user_id = user["id"]
    row = get_user_stats_row(user_id)
    if not row:
        raise HTTPException(status_code=404, detail="No stats found for this user")
    return row
