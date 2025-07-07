# backend/app/api/admin/settings.py

from fastapi import APIRouter, Depends, HTTPException
from app.auth.supabase_auth import get_supabase_user
from app.storage import settings

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

@router.get("/admin/settings")
async def list_settings():
    return await settings.get_all_settings()

@router.post("/admin/settings")
async def create_setting(setting: dict, user=Depends(require_admin)):
    return await settings.add_setting(setting)

@router.put("/admin/settings/{setting_id}")
async def update_setting(setting_id: str, setting: dict, user=Depends(require_admin)):
    allowed_keys = {"value"}
    update_data = {k: v for k, v in setting.items() if k in allowed_keys}
    if not update_data:
        raise HTTPException(status_code=400, detail="Only 'value' can be updated")
    return await settings.update_setting(setting_id, update_data)

@router.delete("/admin/settings/{setting_id}")
async def remove_setting(setting_id: str, user=Depends(require_admin)):
    return await settings.delete_setting(setting_id)
