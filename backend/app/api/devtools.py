import os

from fastapi import APIRouter, HTTPException, Depends, Request

from backend.app.enode import (
    subscribe_to_webhooks
)
from backend.app.security import require_local_request
from backend.app.storage import (
    clear_webhook_events,
    create_api_key_for_user
)

IS_DEV = os.getenv("ENV", "dev") == "dev"

router = APIRouter()

if IS_DEV:
    @router.post("/user/{user_id}/apikey")
    async def create_api_key(
            user_id: str,
            _: None = Depends(require_local_request)
    ):
        """Create an API key manually (for development)"""
        api_key = create_api_key_for_user(user_id)
        return {"user_id": user_id, "api_key": api_key}


    @router.get("/token")
    async def get_token(request: Request):
        """
        Development token endpoint – only accessible from localhost.
        """
        client_ip = request.client.host
        if client_ip not in ["127.0.0.1", "::1"]:
            raise HTTPException(status_code=403, detail=f"Forbidden – not localhost (client_ip: {client_ip})")

        return {"token": "dev-token"}


    @router.delete("/events")
    async def delete_all_events(_: None = Depends(require_local_request)):
        """Delete all stored webhook events (dev only)"""
        clear_webhook_events()
        return {"status": "ok", "message": "All webhook events deleted"}


    @router.post("/webhook/subscribe")
    async def webhook_subscribe(_: None = Depends(require_local_request)):
        """Subscribe to Enode webhook events"""
        try:
            result = await subscribe_to_webhooks()
            return {"status": "success", "result": result}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
