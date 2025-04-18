# app/api.py

from fastapi import APIRouter, HTTPException
from app.enode import get_vehicle_data

router = APIRouter()


@router.get("/vehicle/{vehicle_id}")
async def get_vehicle(vehicle_id: str):
    """
    Returns the latest available vehicle data from cache or Enode.
    """
    vehicle_data = await get_vehicle_data(vehicle_id)

    if not vehicle_data:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    return vehicle_data
