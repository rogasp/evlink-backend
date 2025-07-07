# backend/app/api/admin/users.py

from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import JSONResponse
from app.auth.supabase_auth import get_supabase_user
from app.storage.user import get_all_users_with_enode_info, set_user_approval
from app.enode.user import delete_enode_user

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
async def list_all_users(user=Depends(require_admin)):
    print(f"👮 Admin {user['id']} requested merged user list (Supabase + Enode)")
    users = await get_all_users_with_enode_info()
    print(f"✅ Returning {len(users)} users with merged data")
    return JSONResponse(content=users)

@router.delete("/admin/users/{user_id}")
async def remove_user(user_id: str, user=Depends(require_admin)):
    print(f"🗑️ Admin {user['id']} is attempting to delete Enode user {user_id}")
    try:
        status_code = await delete_enode_user(user_id)
        if status_code == 204:
            print(f"✅ Successfully deleted Enode user {user_id}")
            return Response(status_code=204)
        else:
            print(f"❌ Failed to delete Enode user {user_id}, status_code: {status_code}")
            raise HTTPException(status_code=500, detail="Failed to delete user from Enode")
    except Exception as e:
        print(f"❌ Exception in remove_user: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/admin/users/{user_id}/approve", tags=["user"])
async def update_user_approval(
    user_id: str,
    payload: dict,
    current_user=Depends(require_admin),
):
    is_approved = payload.get("is_approved")
    if is_approved is None:
        raise HTTPException(status_code=400, detail="Missing is_approved")

    try:
        await set_user_approval(user_id, is_approved)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"success": True}
