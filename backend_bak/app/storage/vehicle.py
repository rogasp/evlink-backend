# backend/app/storage/vehicle.py

import json
from datetime import datetime, timezone
from typing import Optional

from app.lib.supabase import supabase_admin, get_supabase_client_with_token


# 🚘 Hämta en specifik cachepost
def get_cached_vehicle(vehicle_id: str) -> Optional[str]:
    try:
        res = supabase_admin.table("vehicles") \
            .select("vehicle_cache") \
            .eq("vehicle_id", vehicle_id) \
            .maybe_single() \
            .execute()
        return res.data["vehicle_cache"] if res.data else None
    except Exception as e:
        print(f"❌ get_cached_vehicle({vehicle_id}) failed:", str(e))
        return None


# 🚘 Hämta alla cachade fordon för en användare
def get_all_cached_vehicles(user_id: str) -> list[dict]:
    try:
        res = supabase_admin.table("vehicles") \
            .select("vehicle_cache, updated_at") \
            .eq("user_id", user_id) \
            .execute()
        return res.data if res.data else []
    except Exception as e:
        print(f"❌ get_all_cached_vehicles({user_id}) failed:", str(e))
        return []


# 🚘 Spara fordon via användarens klient (RLS-skyddad)
def save_vehicle_data_with_client(vehicle: dict, supabase_client):
    try:
        vehicle_id = vehicle.get("id") or vehicle.get("vehicle_id")
        user_id = vehicle.get("userId") or vehicle.get("user_id")
        vendor = vehicle.get("vendor")
        updated_at = datetime.utcnow().isoformat()
        data_str = json.dumps(vehicle)

        if not vehicle_id or not user_id:
            raise ValueError("Missing 'vehicle_id' or 'user_id'")

        payload = {
            "vehicle_id": vehicle_id,
            "user_id": user_id,
            "vendor": vendor,
            "vehicle_cache": data_str,
            "updated_at": updated_at,
        }

        res = supabase_client.table("vehicles") \
            .upsert(payload, on_conflict=["vehicle_id"]) \
            .execute()

        if hasattr(res, "error") and res.error:
            print(f"❌ [save_vehicle_data_with_client] Supabase error: {res.error}")
        else:
            print(f"✅ [save_vehicle_data_with_client] Vehicle {vehicle_id} saved for user {user_id}")

    except Exception as e:
        print(f"❌ [save_vehicle_data_with_client] Exception: {e}")


# 🚘 Spara fordon via admin client (för webhook m.m.)
def save_vehicle_data(vehicle: dict):
    try:
        save_vehicle_data_with_client(vehicle, supabase_admin)
    except Exception as e:
        print(f"❌ [save_vehicle_data] Exception: {e}")


# 🔄 Jämför timestamps
def is_newer_data(incoming: dict, cached: dict) -> bool:
    try:
        incoming_ts = incoming.get("chargeState", {}).get("lastUpdated") or incoming.get("lastSeen")
        cached_ts = cached.get("chargeState", {}).get("lastUpdated") or cached.get("lastSeen")

        if not incoming_ts or not cached_ts:
            return True  # Spara om vi inte kan jämföra

        dt_incoming = datetime.fromisoformat(incoming_ts.replace("Z", "+00:00"))
        dt_cached = datetime.fromisoformat(cached_ts.replace("Z", "+00:00"))

        if dt_incoming.tzinfo is None:
            dt_incoming = dt_incoming.replace(tzinfo=timezone.utc)
        if dt_cached.tzinfo is None:
            dt_cached = dt_cached.replace(tzinfo=timezone.utc)

        return dt_incoming > dt_cached
    except Exception as e:
        print(f"⚠️ Failed to compare timestamps: {e}")
        return True
