# 📄 backend/app/api/private.py

from fastapi import APIRouter, Depends, HTTPException, Path
from datetime import datetime, timezone, timedelta

from pydantic import BaseModel
from app.auth.supabase_auth import get_supabase_user
from app.enode import create_link_session, get_user_vehicles_enode
from app.storage.api_key import create_api_key, get_api_key_info
from app.storage.vehicle import get_all_cached_vehicles, save_vehicle_data_with_client

router = APIRouter()

CACHE_EXPIRATION_MINUTES = 5

class LinkVehicleRequest(BaseModel):
    vendor: str

class LinkVehicleResponse(BaseModel):
    url: str
    linkToken: str 

@router.get("/user/vehicles", response_model=list)
async def get_user_vehicles(user=Depends(get_supabase_user)):
    """
    Return vehicles linked to the authenticated user.
    Cached version is returned if still valid.
    """
    user_id = user["id"]
    now = datetime.now(timezone.utc)

    print(f"🔐 Authenticated user: {user_id} ({user['email']})")

    cached_data = get_all_cached_vehicles(user_id)
    vehicles_from_cache = []

    if cached_data:
        try:
            updated_at = datetime.fromisoformat(cached_data[0]["updated_at"])
            print(f"[🕓 cache-debug] now: {now.isoformat()}, updated_at: {updated_at.isoformat()}")

            if now - updated_at < timedelta(minutes=CACHE_EXPIRATION_MINUTES):
                for row in cached_data:
                    vehicles_from_cache.append(row["vehicle_cache"])
                print(f"✅ Serving {len(vehicles_from_cache)} vehicles from cache")
                return vehicles_from_cache
            else:
                print("ℹ️ Cache expired")

        except Exception as e:
            print(f"[⚠️ cache] Failed to parse updated_at: {e}")

    try:
        fresh_vehicles = await get_user_vehicles_enode(user_id)
        print(f"🔄 Fetched {len(fresh_vehicles)} fresh vehicle(s) from Enode")

        for vehicle in fresh_vehicles:
            vehicle["userId"] = user_id
            save_vehicle_data_with_client(vehicle)

        print(f"💾 Saved {len(fresh_vehicles)} vehicle(s) to Supabase")
        return fresh_vehicles

    except Exception as e:
        print(f"[❌ fetch_fresh] Failed to fetch or save vehicles: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch vehicles")

@router.post("/users/{user_id}/apikey")
async def create_user_api_key(user_id: str = Path(...), user=Depends(get_supabase_user)):
    if user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to create API key for another user")

    print(f"🔑 Creating API key for user: {user_id}")
    raw_key = create_api_key(user_id)
    print(f"✅ API key created for user: {user_id}")
    return {"api_key": raw_key}

@router.get("/users/{user_id}/apikey")
async def get_user_api_key_info(user_id: str = Path(...), user=Depends(get_supabase_user)):
    if user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view API key for another user")

    print(f"🔍 Looking up API key for user: {user_id}")
    info = get_api_key_info(user_id)

    if info:
        print(f"✅ Found API key created at: {info['created_at']}")
        return {
            "api_key_masked": "***************",
            "created_at": info["created_at"]
        }
    else:
        print(f"⚠️ No API key found for user: {user_id}")
        return {"api_key_masked": None}
    
@router.post("/user/link-vehicle", response_model=LinkVehicleResponse)
async def api_create_link_session(
    request: LinkVehicleRequest,
    user=Depends(get_supabase_user),
):
    """
    Create a linking session for a vehicle vendor via Enode v3
    """
    try:
        user_id = user["id"]
        print(f"🔗 Creating link session for user {user_id} and vendor {request.vendor}")

        session = await create_link_session(user_id=user_id, vendor=request.vendor)

        link_url = session.get("linkUrl")
        link_token = session.get("linkToken")

        if not link_url or not link_token:
            print(f"❌ Invalid session response from Enode: {session}")
            raise HTTPException(status_code=500, detail="Missing 'linkUrl' or 'linkToken' in Enode response")

        print(f"✅ Link session created for {user_id}: {link_url}")
        return LinkVehicleResponse(
            url=link_url,
            linkToken=link_token
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[❌ ERROR] Failed to create link session: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create link session: {str(e)}")
    