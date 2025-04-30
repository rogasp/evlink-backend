# backend/app/storage/vehicle.py

from datetime import datetime
import json
from app.storage.db import supabase

def is_newer_data(incoming: dict, cached: dict) -> bool:
    try:
        incoming_ts = incoming.get("chargeState", {}).get("lastUpdated") or incoming.get("lastSeen")
        cached_ts = cached.get("chargeState", {}).get("lastUpdated") or cached.get("lastSeen")

        if not incoming_ts or not cached_ts:
            return True

        dt_incoming = datetime.fromisoformat(incoming_ts.replace("Z", "+00:00"))
        dt_cached = datetime.fromisoformat(cached_ts.replace("Z", "+00:00"))

        return dt_incoming > dt_cached
    except Exception as e:
        print(f"⚠️ Failed to compare timestamps: {e}")
        return True

def save_vehicle_data(vehicle: dict):
    vehicle_id = vehicle.get("id")
    user_id = vehicle.get("userId")
    if not vehicle_id or not user_id:
        print("[⚠️] Invalid vehicle object:", vehicle)
        return

    cached = get_cached_vehicle(vehicle_id)
    if cached and not is_newer_data(vehicle, cached):
        print(f"⚠️ Webhook-data för {vehicle_id} är äldre – cache uppdateras ej.")
        return

    updated_at = vehicle.get("chargeState", {}).get("lastUpdated") or vehicle.get("lastSeen") or datetime.utcnow().isoformat()
    vehicle_data = {
        "vehicle_id": vehicle_id,
        "user_id": user_id,
        "vehicle_cache": vehicle,
        "updated_at": updated_at
    }

    supabase.table("vehicles").upsert(vehicle_data).execute()
    print(f"✅ Vehicle {vehicle_id} updated in cache")

def get_cached_vehicle(vehicle_id: str) -> dict | None:
    res = supabase.table("vehicles").select("vehicle_cache").eq("vehicle_id", vehicle_id).single().execute()
    return res.data["vehicle_cache"] if res.data else None

def get_all_cached_vehicles(user_id: str) -> list[dict]:
    res = supabase.table("vehicles").select("vehicle_cache, updated_at").eq("user_id", user_id).execute()
    return res.data or []
