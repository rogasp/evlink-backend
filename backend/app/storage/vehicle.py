from app.storage.db import supabase
from typing import Optional
from datetime import datetime, timezone
from dateutil import parser
import json

def get_cached_vehicle(vehicle_id: str) -> Optional[str]:
    try:
        res = supabase.table("vehicles") \
            .select("vehicle_cache") \
            .eq("vehicle_id", vehicle_id) \
            .maybe_single() \
            .execute()
        return res.data["vehicle_cache"] if res.data else None
    except Exception as e:
        print(f"❌ get_cached_vehicle({vehicle_id}) failed:", str(e))
        return None


def get_all_cached_vehicles(user_id: str) -> list[dict]:
    try:
        res = supabase.table("vehicles") \
            .select("vehicle_cache, updated_at") \
            .eq("user_id", user_id) \
            .execute()

        return res.data if res.data else []
    except Exception as e:
        print(f"❌ get_all_cached_vehicles({user_id}) failed:", str(e))
        return []

def save_vehicle_data(vehicle: dict) -> None:
    try:
        vehicle_id = vehicle.get("id")
        user_id = vehicle.get("userId")
        vendor = vehicle.get("vendor") or None

        if not vehicle_id or not user_id:
            print(f"[⚠️ save_vehicle_data] Invalid vehicle object – missing id/userId: {vehicle}")
            return

        updated_at = datetime.utcnow().isoformat()

        data_str = json.dumps(vehicle)

        res = supabase.table("vehicles").upsert({
            "vehicle_id": vehicle_id,
            "user_id": user_id,
            "vendor": vendor,
            "vehicle_cache": data_str,
            "updated_at": updated_at
        }, on_conflict=["vehicle_id"]).execute()

        if not res.data:
            print(f"❌ save_vehicle_data({vehicle_id}) failed: {res}")
        else:
            print(f"✅ Vehicle {vehicle_id} saved/updated for user {user_id}")
    except Exception as e:
        print(f"❌ save_vehicle_data({vehicle.get('id')}) failed: {e}")


def is_newer_data(incoming: dict, cached: dict) -> bool:
    try:
        incoming_ts = incoming.get("chargeState", {}).get("lastUpdated") or incoming.get("lastSeen")
        cached_ts = cached.get("chargeState", {}).get("lastUpdated") or cached.get("lastSeen")

        if not incoming_ts or not cached_ts:
            return True  # Save if we can't compare

        dt_incoming = datetime.fromisoformat(incoming_ts.replace("Z", "+00:00"))
        dt_cached = datetime.fromisoformat(cached_ts.replace("Z", "+00:00"))

        # 🩹 Gör båda tiderna UTC-aware
        if dt_incoming.tzinfo is None:
            dt_incoming = dt_incoming.replace(tzinfo=timezone.utc)
        if dt_cached.tzinfo is None:
            dt_cached = dt_cached.replace(tzinfo=timezone.utc)

        return dt_incoming > dt_cached
    except Exception as e:
        print(f"⚠️ Failed to compare timestamps: {e}")
        return True  # Save just in case
