import os
from fastapi import APIRouter, Depends
from app.enode import get_access_token, subscribe_to_webhooks
from app.security import require_local_request
from app.storage import create_api_key_for_user, clear_webhook_events

IS_DEV = os.getenv("ENV", "dev") == "dev"

router = APIRouter()

if IS_DEV:

    @router.post("/user/{user_id}/apikey")
    async def create_api_key(user_id: str, _: None = Depends(require_local_request)):
        return {"api_key": create_api_key_for_user(user_id)}

    @router.get("/token")
    async def get_token(_: None = Depends(require_local_request)):
        return {"access_token": await get_access_token()}

    @router.delete("/events")
    async def delete_all_events(_: None = Depends(require_local_request)):
        clear_webhook_events()
        return {"message": "all events deleted"}

    @router.post("/webhook/subscribe")
    async def webhook_subscribe(_: None = Depends(require_local_request)):
        result = await subscribe_to_webhooks()
        return {"subscribed": True, "result": result}
