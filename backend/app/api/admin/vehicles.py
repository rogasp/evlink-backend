# backend/app/api/admin/vehicles.py

from fastapi import APIRouter, Depends, HTTPException
from app.auth.supabase_auth import get_supabase_user
from app.enode.vehicle import get_all_vehicles

router = APIRouter()

def require_admin(user=Depends(get_supabase_user)):
    print("🔍 Admin check - Full user object:")
    # print(user)

    role = user.get("user_metadata", {}).get("role")
    print(f"🔐 Extracted role: {role}")

    if role != "admin":
        print(f"⛔ Access denied: user {user['id']} with role '{role}' tried to access admin route")
        raise HTTPException(status_code=403, detail="Admin access required")

    print(f"✅ Admin access granted to user {user['id']}")
    return user

@router.get("/admin/vehicles")
async def list_all_vehicles(user=Depends(require_admin)):
    print(f"👮 Admin {user['id']} requested list of all vehicles")
    try:
        data = await get_all_vehicles()
        vehicles = data.get("data", [])
        print(f"✅ Fetched {len(vehicles)} vehicle(s) from Enode")
        return vehicles
    except Exception as e:
        print(f"[❌ Enode API] Failed to fetch vehicles: {e}")
        raise HTTPException(status_code=502, detail="Failed to fetch vehicles from Enode")
