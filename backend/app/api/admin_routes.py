# backend/app/api/admin_routes.py

from fastapi import APIRouter, Depends
from app.enode import subscribe_to_webhooks
from app.security import verify_jwt_token  # eller get_current_user om du vill begränsa
from fastapi.responses import JSONResponse

router = APIRouter()

@router.post("/admin/webhook/subscribe")
async def trigger_webhook_subscription(token_data: dict = Depends(verify_jwt_token)):
    # 🚫 Valfritt: begränsa till admin-användare
    # if token_data["sub"] != "your_admin_user_id":
    #     return JSONResponse(status_code=403, content={"message": "Access denied"})

    result = await subscribe_to_webhooks()
    return {"status": "ok", "result": result}
