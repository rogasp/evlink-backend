# backend/app/api/user_routes.py

from datetime import datetime, timedelta
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

    # Step 1: Load all cached vehicles for the user
    cached_data = get_all_cached_vehicles(user_id)

    if cached_data:
        now = datetime.utcnow()
        try:
            updated_at = datetime.fromisoformat(cached_data[0]["updated_at"])
            if now - updated_at < timedelta(minutes=CACHE_EXPIRATION_MINUTES):
                vehicles = []
                for row in cached_data:
                    try:
                        # Supabase version returnerar dict direkt
                        vehicle_data = row["vehicle_cache"]
                        vehicles.append(vehicle_data)
                    except Exception as e:
                        print("[⚠️ cache] Failed to extract vehicle data:", e)
                return vehicles
        except Exception as e:
            print("[⚠️ cache] Failed to parse updated_at:", e)

    # Step 2: Load fresh data from Enode
    try:
        vehicles = await get_user_vehicles_enode(user_id)
        for vehicle in vehicles:
            vehicle["userId"] = user_id  # 🧩 Important: assign manually
            save_vehicle_data(vehicle)
        return vehicles
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch vehicles: {str(e)}")
