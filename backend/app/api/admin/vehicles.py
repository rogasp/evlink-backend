# backend/app/api/admin/vehicles.py
"""Admin endpoints for managing vehicles."""

import logging
from fastapi import APIRouter, Depends, HTTPException
from app.auth.supabase_auth import get_supabase_user
from app.enode.vehicle import get_all_vehicles

logger = logging.getLogger(__name__)

router = APIRouter()

# TODO: Add docstrings to all functions in this file.

def require_admin(user=Depends(get_supabase_user)):
    logger.info("🔍 Admin check - Full user object:")
    # logger.info(user)

    role = user.get("user_metadata", {}).get("role")
    logger.info(f"🔐 Extracted role: {role}")

    if role != "admin":
        logger.warning(f"⛔ Access denied: user {user['id']} with role '{role}' tried to access admin route")
        raise HTTPException(status_code=403, detail="Admin access required")

    logger.info(f"✅ Admin access granted to user {user['id']}")
    return user

@router.get("/admin/vehicles")
async def list_all_vehicles(user=Depends(require_admin)):
    logger.info(f"👮 Admin {user['id']} requested list of all vehicles")
    try:
        data = await get_all_vehicles()
        vehicles = data.get("data", [])
        logger.info(f"✅ Fetched {len(vehicles)} vehicle(s) from Enode")
        return vehicles
    except Exception as e:
        logger.error(f"[❌ Enode API] Failed to fetch vehicles: {e}")
        raise HTTPException(status_code=502, detail="Failed to fetch vehicles from Enode")
