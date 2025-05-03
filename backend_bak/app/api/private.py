from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.config import CACHE_EXPIRATION_MINUTES
from app.enode import get_user_vehicles_enode
from app.storage.vehicle import get_all_cached_vehicles, save_vehicle_data_with_client
from app.storage.user import update_user_email
from app.auth.supabase_auth import get_supabase_user
from app.lib.supabase import get_supabase_client_with_token

router = APIRouter()


class UpdateEmailRequest(BaseModel):
    email: EmailStr


@router.post("/users/{user_id}/email")
async def update_email(user_id: str, payload: UpdateEmailRequest, user=Depends(get_supabase_user)):
    if user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to update this user")

    supabase = get_supabase_client_with_token(user.access_token)

    update_user_email(user_id, payload.email, supabase)
    return {"message": "Email updated successfully"}

@router.get("/user/vehicles", response_model=list)
async def get_user_vehicles(user=Depends(get_supabase_user)):
    supabase = get_supabase_client_with_token(user.access_token)  # 🧠 ny klient
    user_id = user.id
    now = datetime.now(timezone.utc)

    cached_data = get_all_cached_vehicles(user_id)
    vehicles_from_cache = []

    if cached_data:
        try:
            updated_at = datetime.fromisoformat(cached_data[0]["updated_at"])
            print(f"[🕓 cache-debug] now: {now.isoformat()}, updated_at: {updated_at.isoformat()}")

            if now - updated_at < timedelta(minutes=CACHE_EXPIRATION_MINUTES):
                for row in cached_data:
                    vehicles_from_cache.append(row["vehicle_cache"])
                print("✅ Serving vehicles from cache")
                return vehicles_from_cache
        except Exception as e:
            print(f"[⚠️ cache] Failed to parse updated_at: {e}")

    try:
        fresh_vehicles = await get_user_vehicles_enode(user_id)

        for vehicle in fresh_vehicles:
            vehicle["userId"] = user_id
            save_vehicle_data_with_client(vehicle, supabase)  # 🆕 använder användarens token

        return fresh_vehicles
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch vehicles: {str(e)}")
    