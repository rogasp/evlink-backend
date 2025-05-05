# 📄 backend/app/api/admin.py

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import JSONResponse
from app.auth.supabase_auth import get_supabase_user
from app.enode import delete_enode_user, delete_webhook, get_all_users, get_all_vehicles, subscribe_to_webhooks
from app.storage.user import get_all_users_with_enode_info
from app.storage.webhook import get_all_webhook_subscriptions, get_webhook_logs, mark_webhook_as_inactive, save_webhook_subscription, sync_webhook_subscriptions_from_enode

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

@router.get("/webhook/subscriptions")
async def list_enode_webhooks(user=Depends(require_admin)):
    try:
        print("[🔄] Syncing subscriptions from Enode → Supabase...")
        await sync_webhook_subscriptions_from_enode()
        result = await get_all_webhook_subscriptions()
        print(f"[✅] Returning {len(result)} subscriptions")
        return result
    except Exception as e:
        print(f"[❌ ERROR] {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/webhook/logs")
def fetch_webhook_logs(
    event: str | None = Query(None),
    limit: int = Query(50, ge=1, le=1000),
    user=Depends(require_admin),
):
    try:
        logs = get_webhook_logs(limit=limit, event_filter=event)
        print("[🐞 DEBUG] Webhook logs sample:", logs[:1])
        return logs
    except Exception as e:
        print(f"[❌ fetch_webhook_logs] {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve webhook logs")
    
@router.post("/webhook/subscriptions")
async def create_enode_webhook(user=Depends(require_admin)):
    try:
        response = await subscribe_to_webhooks()
        await save_webhook_subscription(response)
        return response
    except Exception as e:
        print(f"[❌ create_enode_webhook] {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/webhook/subscriptions/{webhook_id}")
async def delete_enode_webhook(webhook_id: str, user=Depends(require_admin)):
    try:
        await mark_webhook_as_inactive(webhook_id)
        await delete_webhook(webhook_id)
        return {"deleted": True}
    except Exception as e:
        print(f"[❌ delete_enode_webhook] {e}")
        raise HTTPException(status_code=500, detail=str(e))