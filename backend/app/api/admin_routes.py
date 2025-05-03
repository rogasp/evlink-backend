from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import JSONResponse

from app.enode import delete_enode_user, get_all_users, get_all_vehicles, subscribe_to_webhooks
from app.storage.webhook import sync_webhook_subscriptions_from_enode
from app.auth.supabase_auth import get_supabase_user

router = APIRouter()

def require_admin(user=Depends(get_supabase_user)):
    role = user.user_metadata.get("role")
    if role != "admin":
        print(f"⛔ Access denied: user {user.id} with role '{role}' tried to access admin route")
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.post("/admin/webhook/subscribe")
async def trigger_webhook_subscription(user=Depends(require_admin)):
    result = await subscribe_to_webhooks()
    return {"status": "ok", "result": result}

@router.get("/admin/vehicles")
async def list_all_vehicles(user=Depends(require_admin)):
    data = await get_all_vehicles()
    return data.get("data", [])

@router.get("/admin/users")
async def list_all_users(user=Depends(require_admin)):
    data = await get_all_users()
    return data.get("data", [])

@router.delete("/admin/users/{user_id}")
async def remove_user(user_id: str, user=Depends(require_admin)):
    status_code = await delete_enode_user(user_id)
    if status_code == 204:
        return Response(status_code=204)
    else:
        raise HTTPException(status_code=500, detail="Failed to delete user from Enode")

@router.post("/admin/webhooks/sync")
async def sync_webhook_subscriptions(user=Depends(require_admin)):
    await sync_webhook_subscriptions_from_enode()
    return {"status": "synced"}
