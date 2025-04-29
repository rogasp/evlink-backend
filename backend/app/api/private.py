from datetime import datetime, timedelta
import json
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.security import get_current_user, verify_jwt_token
from app.storage import cache_vehicle_data, get_all_cached_vehicles, update_user_email
from app.config import CACHE_EXPIRATION_MINUTES
from app.enode import get_user_vehicles_enode

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
            # Kontrollera om första raden är färsk nog
            updated_at = datetime.fromisoformat(cached_data[0]["updated_at"])
            if now - updated_at < timedelta(minutes=CACHE_EXPIRATION_MINUTES):
                vehicles = []
                for row in cached_data:
                    try:
                        vehicle_data = json.loads(row["data"])
                        vehicles.append(vehicle_data)
                    except Exception as e:
                        print("[⚠️ cache] Failed to decode vehicle JSON:", e)
                return vehicles
        except Exception as e:
            print("[⚠️ cache] Failed to parse updated_at:", e)

    # Step 2: Load fresh data from Enode
    try:
        vehicles = await get_user_vehicles_enode(user_id)
        now_str = datetime.utcnow().isoformat()
        for vehicle in vehicles:
            vehicle_id = vehicle["id"]
            cache_vehicle_data(
                user_id=user_id,
                vehicle_id=vehicle_id,
                data=json.dumps(vehicle),
                updated_at=now_str
            )
        return vehicles
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch vehicles: {str(e)}")