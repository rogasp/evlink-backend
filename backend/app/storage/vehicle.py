# 📄 backend/app/storage/vehicle.py

from datetime import datetime, timedelta
import json
import logging
from app.lib.supabase import get_supabase_admin_client
from app.logic.vehicle import handle_offline_notification_if_needed

logger = logging.getLogger(__name__)

def get_all_cached_vehicles(user_id: str) -> list[dict]:
    """
    Return all cached vehicles for a specific user.
    """
    supabase = get_supabase_admin_client()
    logger.info(f"[🔎 get_all_cached_vehicles] Fetching vehicles for user_id: {user_id}")
    try:
        response = supabase \
            .table("vehicles") \
            .select("id, vehicle_cache, updated_at") \
            .eq("user_id", user_id) \
            .execute()
        return response.data or []
    except Exception as e:
        logger.error(f"[❌ get_all_cached_vehicles] Exception: {e}")
        return []

async def save_vehicle_data_with_client(vehicle: dict):
    """
    Save vehicle cache entry, overwriting if vehicle_id exists.
    Handles offline notifications if vehicle status changes.
    """
    supabase = get_supabase_admin_client()
    try:
        vehicle_id = vehicle.get("id") or vehicle.get("vehicle_id")
        user_id    = vehicle.get("userId") or vehicle.get("user_id")
        vendor     = vehicle.get("vendor")
        online     = vehicle.get("isReachable", False)
        data_str   = json.dumps(vehicle)
        updated_at = datetime.utcnow().isoformat()

        if not vehicle_id or not user_id:
            raise ValueError("Missing vehicle_id or user_id in vehicle object")

        payload = {
            "vehicle_id":   vehicle_id,
            "user_id":      user_id,
            "vendor":       vendor,
            "online":       online,
            "vehicle_cache": data_str,
            "updated_at":   updated_at
        }

        # --- DEBUG: Show payload and types ---
        logger.debug(f"[🔍 DEBUG] payload keys: {list(payload.keys())}")
        logger.debug(f"[🔍 DEBUG] payload types: {{k: type(v) for k,v in payload.items()}}")

        # --- 1) Try fetching existing row ---
        select_q = supabase.table("vehicles").select("online").eq("vehicle_id", vehicle_id).maybe_single()
        logger.debug(f"[🔍 DEBUG] about to execute select: {select_q!r}")
        existing = select_q.execute()
        logger.debug(f"[🔍 DEBUG] select response repr: {existing!r}")
        logger.debug(f"[🔍 DEBUG] select.data type: {type(getattr(existing, 'data', None))}, data: {getattr(existing,'data',None)}")

        if not getattr(existing, "data", None):
            logger.info(f"[ℹ️] Vehicle {vehicle_id} is new – skipping notification logic")
        else:
            online_old = existing.data.get("online")
            logger.info(f"[ℹ️] Vehicle {vehicle_id} exists, online_old={online_old}, online_new={online}")
            await handle_offline_notification_if_needed(
                vehicle_id=vehicle_id,
                user_id=user_id,
                online_old=online_old,
                online_new=online,
            )

        # --- 2) Upsert ---
        logger.debug(f"[💾 DEBUG] about to upsert payload")
        upsert_q = supabase.table("vehicles").upsert(payload, on_conflict=["vehicle_id"])
        logger.debug(f"[🔍 DEBUG] upsert query repr: {upsert_q!r}")
        res = upsert_q.execute()
        # logger.debug(f"[🔍 DEBUG] upsert response repr: {res!r}")
        logger.debug(f"[🔍 DEBUG] upsert.data type: {type(getattr(res, 'data', None))}, data: {getattr(res,'data',None)}")

        if not getattr(res, "data", None):
            logger.warning(f"⚠️ save_vehicle_data_with_client: No data returned, possible failure")
        else:
            logger.info(f"✅ Vehicle {vehicle_id} saved for user {user_id}")

    except Exception as e:
        logger.error(f"[❌ save_vehicle_data_with_client] Exception: {e}")


async def get_vehicle_by_id(vehicle_id: str):
    """Retrieves a vehicle record by its internal database ID."""
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
    """Retrieves a vehicle record by its Enode vehicle ID."""
    supabase = get_supabase_admin_client()
    response = supabase.table("vehicles") \
        .select("*") \
        .eq("vehicle_id", vehicle_id) \
        .maybe_single() \
        .execute()

    if not response or not response.data:
        return None

    return response.data

async def get_total_vehicle_count() -> int:
    """
    Returns the total number of vehicles in the database.
    """
    supabase = get_supabase_admin_client()
    try:
        res = supabase.table("vehicles").select("id", count="exact").execute()
        return res.count
    except Exception as e:
        logger.error(f"[❌ get_total_vehicle_count] {e}")
        return 0

async def get_new_vehicle_count(days: int) -> int:
    """
    Returns the number of new vehicles created within the last 'days' days.
    """
    supabase = get_supabase_admin_client()
    try:
        time_ago = datetime.utcnow() - timedelta(days=days)
        time_ago_iso = time_ago.isoformat() + "Z"

        res = supabase.table("vehicles").select("id", count="exact").gte("created_at", time_ago_iso).execute()
        return res.count
    except Exception as e:
        logger.error(f"[❌ get_new_vehicle_count] {e}")
        return 0