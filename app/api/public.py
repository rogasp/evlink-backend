from fastapi import APIRouter, Body, HTTPException
from app.enode import get_link_result
from app.storage import save_linked_vendor

router = APIRouter()

@router.get("/ping")
async def ping():
    return {"message": "pong"}

@router.post("/confirm-link")
async def confirm_link(payload: dict = Body(...)):
    link_token = payload.get("token")
    if not link_token:
        raise HTTPException(status_code=400, detail="Missing link token")

    try:
        link_info = await get_link_result(link_token)
        user_id = link_info.get("userId")
        vendor = link_info.get("vendor")

        if user_id and vendor:
            save_linked_vendor(user_id, vendor)

        return {
            "message": "Vendor successfully linked",
            "userId": user_id,
            "vendor": vendor
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to verify link token: {str(e)}")
