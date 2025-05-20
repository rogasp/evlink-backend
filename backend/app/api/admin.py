# 📄 backend/app/api/admin.py

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from fastapi.responses import JSONResponse
from app.auth.service_role_auth import verify_service_role_token
from app.auth.supabase_auth import get_supabase_user
from app.enode.user import delete_enode_user
from app.enode.vehicle import get_all_vehicles
from app.enode.webhook import subscribe_to_webhooks, delete_webhook
from app.services.email import send_access_invite_email, send_interest_email
from app.storage import settings
from app.storage.interest import count_uncontacted_interest, generate_codes_for_interest_ids, get_interest_by_id, get_uncontacted_interest_entries, list_interest_entries, mark_interest_contacted
from app.storage.user import get_all_users_with_enode_info, set_user_approval
from app.storage.webhook import get_all_webhook_subscriptions, get_webhook_logs, mark_webhook_as_inactive, save_webhook_subscription, sync_webhook_subscriptions_from_enode
from app.storage.webhook_monitor import monitor_webhook_health

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
    user_q: str | None = Query(None),
    vehicle_q: str | None = Query(None),
    limit: int = Query(50, ge=1, le=1000),
    user=Depends(require_admin),
):
    try:
        print(f"[🔍] Fetching webhook logs with filters: event={event}, user={user_q}, vehicle={vehicle_q}, limit={limit}")
        logs = get_webhook_logs(
            limit=limit,
            event_filter=event,
            user_filter=user_q,
            vehicle_filter=vehicle_q,
        )
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

@router.post("/admin/webhook/monitor")
async def run_webhook_monitor(user=Depends(verify_service_role_token)):
    """
    Run webhook health monitoring manually (sync + check + auto test).
    """
    await monitor_webhook_health()
    return {"status": "completed"}

@router.post("/admin/webhook/monitor/admin", tags=["admin"])
async def run_webhook_monitor_admin(user: dict = Depends(require_admin)):
    """Run webhook monitor with admin Supabase role."""
    await monitor_webhook_health()
    return {"status": "completed"}

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

@router.post("/admin/interest/contact")
async def contact_all_interested(user=Depends(require_admin)):
    entries = await get_uncontacted_interest_entries()
    contacted = 0

    for entry in entries:
        try:
            await send_interest_email(email=entry["email"], name=entry.get("name", "friend"))
            await mark_interest_contacted(entry["id"])
            contacted += 1
        except Exception as e:
            print(f"[❌] Could not contact {entry['email']}: {e}")

    return {"message": f"Contacted {contacted} interest submissions."}

@router.get("/admin/interest")
async def list_interest(user=Depends(require_admin)):
    return await list_interest_entries()

@router.get("/admin/interest/uncontacted/count")
async def count_interest(user=Depends(require_admin)):
    count = await count_uncontacted_interest()
    return {"count": count}

@router.post("/admin/interest/generate-codes")
async def generate_interest_codes(request: Request):
    data = await request.json()
    interest_ids = data.get("interest_ids", [])

    if not interest_ids or not isinstance(interest_ids, list):
        raise HTTPException(status_code=400, detail="Missing interest_ids")

    updated = await generate_codes_for_interest_ids(interest_ids)

    return {"updated": updated}

@router.post("/admin/interest/send-codes")
async def send_access_invites(request: Request):
    data = await request.json()
    interest_ids = data.get("interest_ids", [])

    if not interest_ids or not isinstance(interest_ids, list):
        raise HTTPException(status_code=400, detail="Missing interest_ids")

    sent = 0

    for interest_id in interest_ids:
        result = await get_interest_by_id(interest_id)

        if not result:
            continue

        # Skip if already linked to user or no access_code
        if result.get("user_id") or not result.get("access_code"):
            continue

        try:
            await send_access_invite_email(
                email=result["email"],
                name=result["name"] or "there",
                code=result["access_code"]
            )
            sent += 1
        except Exception as e:
            print(f"[❌] Failed to send to {result['email']}: {e}")

    return {"sent": sent}
