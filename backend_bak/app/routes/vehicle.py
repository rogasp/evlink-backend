from fastapi import APIRouter
from app.storage.vehicle import get_all_cached_vehicles

router = APIRouter()

@router.get("/user/{user_id}/vehicles")
def list_user_vehicles(user_id: str):
    return get_all_cached_vehicles(user_id)
