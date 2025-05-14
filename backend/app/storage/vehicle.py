# 📄 backend/app/storage/vehicle.py

from datetime import datetime
import json
from app.lib.supabase import get_supabase_admin_client

def get_all_cached_vehicles(user_id: str) -> list[dict]:
    """
    Return all cached vehicles for a specific user.
    """
    supabase = get_supabase_admin_client()
    print(f"[🔎 get_all_cached_vehicles] Fetching vehicles for user_id: {user_id}")
    try:
        response = supabase \
            .table("vehicles") \
            .select("vehicle_cache, updated_at") \
            .eq("user_id", user_id) \
            .execute()
        return response.data or []
    except Exception as e:
        print(f"[❌ get_all_cached_vehicles] Exception: {e}")
        return []

def save_vehicle_data_with_client(vehicle: dict):
    """
    Save vehicle cache entry, overwriting if vehicle_id exists.
    """
    supabase = get_supabase_admin_client()
    try:
        vehicle_id = vehicle.get("id") or vehicle.get("vehicle_id")
        user_id = vehicle.get("userId") or vehicle.get("user_id")
        vendor = vehicle.get("vendor")
        data_str = json.dumps(vehicle)
        updated_at = datetime.utcnow().isoformat()

        if not vehicle_id or not user_id:
            raise ValueError("Missing vehicle_id or user_id in vehicle object")

        payload = {
            "vehicle_id": vehicle_id,
            "user_id": user_id,
            "vendor": vendor,
            "vehicle_cache": data_str,
            "updated_at": updated_at
        }

        print(f"[💾 save_vehicle_data_with_client] Saving vehicle {vehicle_id} for user {user_id}")
        res = supabase \
            .table("vehicles") \
            .upsert(payload, on_conflict=["vehicle_id"]) \
            .execute()

        if not res.data:
            print(f"⚠️ save_vehicle_data_with_client: No data returned, possible failure")
        else:
            print(f"✅ Vehicle {vehicle_id} saved for user {user_id}")

    except Exception as e:
        print(f"[❌ save_vehicle_data_with_client] Exception: {e}")

async def get_vehicle_by_id(vehicle_id: str):
    supabase = get_supabase_admin_client()
    response = supabase.table("vehicles") \
        .select("*") \
        .eq("id", vehicle_id) \
        .maybe_single() \
        .execute()

    if not response or not response.data:
        return None

    return response.data

async def get_vehicle_by_vehicle_id(vehicle_id: str):
    supabase = get_supabase_admin_client()
    response = supabase.table("vehicles") \
        .select("*") \
        .eq("vehicle_id", vehicle_id) \
        .maybe_single() \
        .execute()

    if not response or not response.data:
        return None

    return response.data