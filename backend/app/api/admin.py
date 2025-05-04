# 📄 backend/app/api/admin.py

from fastapi import APIRouter, Depends, HTTPException
from app.auth.supabase_auth import get_supabase_user
from app.enode import get_all_users

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


@router.get("/admin/users")
async def list_all_enode_users(user=Depends(require_admin)):
    print(f"👮 Admin {user['id']} requested list of Enode users")
    try:
        data = await get_all_users()
        print(f"✅ Fetched {len(data.get('data', []))} users from Enode")
        return data.get("data", [])
    except Exception as e:
        print(f"[❌ Enode API] Failed to fetch users: {e}")
        raise HTTPException(status_code=502, detail="Failed to fetch users from Enode")
