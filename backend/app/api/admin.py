# 📄 backend/app/api/admin.py

from fastapi import APIRouter, Depends, HTTPException, Query
from app.auth.supabase_auth import get_supabase_user
from app.enode import get_all_users, get_all_vehicles
from app.storage.webhook import get_all_webhook_subscriptions, get_webhook_logs, sync_webhook_subscriptions_from_enode

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