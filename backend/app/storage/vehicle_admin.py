# backend/app/storage/vehicle_admin.py

from app.lib.supabase import supabase_admin  # ✅ byter import
from datetime import datetime
import json


def save_vehicle_data_with_admin_client(vehicle: dict):
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

        res = supabase_admin.table("vehicles").upsert(payload, on_conflict=["vehicle_id"]).execute()

        if hasattr(res, "error") and res.error:
            print(f"❌ [save_vehicle_data_with_admin_client] Supabase error: {res.error}")
        else:
            print(f"✅ [save_vehicle_data_with_admin_client] Vehicle {vehicle_id} saved for user {user_id}")

    except Exception as e:
        print(f"❌ [save_vehicle_data_with_admin_client] Exception: {e}")
