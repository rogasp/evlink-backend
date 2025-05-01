# backend/app/api/user_routes.py

from datetime import datetime, timedelta, timezone
import json
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.security import get_current_user, verify_jwt_token
from app.config import CACHE_EXPIRATION_MINUTES
from app.enode import get_user_vehicles_enode

from app.storage.vehicle import get_all_cached_vehicles, save_vehicle_data
from app.storage.user import update_user_email

router = APIRouter()

class UpdateEmailRequest(BaseModel):
    email: EmailStr

@router.post("/users/{user_id}/email")
async def update_email(user_id: str, payload: UpdateEmailRequest, token_data: dict = Depends(verify_jwt_token)):
    """Update user's email."""
    if token_data["sub"] != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to update this user")

    update_user_email(user_id, payload.email)
    return {"message": "Email updated successfully"}

@router.get("/user/vehicles", response_model=list)
async def get_user_vehicles(user: dict = Depends(get_current_user)):
    user_id = user["sub"]
    now = datetime.now(timezone.utc)

    # 1️⃣ Läs från cache
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

    # 2️⃣ Om cache saknas eller är gammal → hämta nya fordon
    try:
        fresh_vehicles = await get_user_vehicles_enode(user_id)

        for vehicle in fresh_vehicles:
            vehicle["userId"] = user_id  # 🔧 Viktigt! Lägg till manuellt
            save_vehicle_data(vehicle)

        return fresh_vehicles
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch vehicles: {str(e)}")