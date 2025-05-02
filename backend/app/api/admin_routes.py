# backend/app/api/admin_routes.py

from fastapi import APIRouter, Depends, HTTPException, Response
from app.enode import delete_enode_user, get_all_users, get_all_vehicles, subscribe_to_webhooks
from app.security import verify_jwt_token
from fastapi.responses import JSONResponse

from app.storage.webhook import sync_webhook_subscriptions_from_enode

router = APIRouter()

@router.post("/admin/webhook/subscribe")
async def trigger_webhook_subscription(token_data: dict = Depends(verify_jwt_token)):
    result = await subscribe_to_webhooks()
    return {"status": "ok", "result": result}

@router.get("/admin/vehicles")
async def list_all_vehicles():
    data = await get_all_vehicles()
    return data.get("data", [])  # returnerar bara fordonslistan

@router.get("/admin/users")
async def list_all_users():
    data = await get_all_users()
    return data.get("data", [])  # return only user list

@router.delete("/admin/users/{user_id}")
async def remove_user(user_id: str):
    status_code = await delete_enode_user(user_id)
    if status_code == 204:
        return Response(status_code=204)
    else:
        raise HTTPException(status_code=500, detail="Failed to delete user from Enode")

@router.post("/admin/webhooks/sync")
async def sync_webhook_subscriptions():
    await sync_webhook_subscriptions_from_enode()
    return {"status": "synced"}
