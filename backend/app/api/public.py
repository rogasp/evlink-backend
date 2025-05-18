# app/api/public.py

from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel, EmailStr

from app.enode.link import get_link_result
from app.lib.supabase import get_supabase_admin_client
from app.storage.interest import assign_interest_user, get_interest_by_access_code, save_interest
from app.storage.status_logs import calculate_uptime, get_daily_status, get_status_panel_data

router = APIRouter()

class InterestSubmission(BaseModel):
    name: str
    email: EmailStr


@router.get("/status")
async def status():
    return {"status": "ok"}

@router.get("/ping")
async def ping():
    return {"message": "pong"}

@router.post("/interest")
async def submit_interest(data: InterestSubmission, request: Request):
    try:
        save_interest(data.name, data.email)
        return {"message": "Thanks! We'll notify you when we launch."}
    except Exception as e:
        print(f"❌ Interest submission error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
@router.post("/user/link-result", response_model=dict)
async def post_link_result(data: dict):
    """
    Called by frontend after Enode redirects user back with a linkToken.
    No auth required, but linkToken is validated server-side.
    """
    link_token = data.get("linkToken")
    if not link_token:
        raise HTTPException(status_code=400, detail="Missing linkToken")

    result = await get_link_result(link_token)
    user_id = result.get("userId")
    vendor = result.get("vendor")

    print(f"🔗 Received link result for Enode user_id: {user_id} via token {link_token}")

    if not user_id or not vendor:
        print("⚠️ Incomplete data from Enode in link result")
        raise HTTPException(status_code=400, detail="Invalid link result")

    # Optional: check if user exists in our system
    # from app.storage.users import get_user
    # user = await get_user(user_id)
    # if not user:
    #     print(f"⛔ user_id {user_id} not found in database")
    #     raise HTTPException(status_code=404, detail="Unknown user")

    return {
        "vendor": vendor,
        "userId": user_id,
        "status": "linked"
    }

@router.get("/public/registration-allowed")
async def is_registration_allowed():
    from app.storage.settings import get_setting_by_name
    setting = await get_setting_by_name("allow_registration")
    if not setting:
        return {"allowed": False}
    return {"allowed": setting.get("value") == "true"}

@router.get("/public/status/webhook")
async def webhook_status_panel(
    category: str = Query("webhook_incoming"),
    from_date: datetime = Query(...),
    to_date: datetime = Query(...)
):
    return await get_status_panel_data(category, from_date, to_date)


@router.get("/public/status/webhook/uptime")
async def get_uptime(
    category: str,
    from_date: datetime = Query(default_factory=lambda: datetime.utcnow() - timedelta(days=30)),
    to_date: datetime = Query(default_factory=lambda: datetime.utcnow()),
):
    uptime = await calculate_uptime(category, from_date, to_date)
    return {"uptime": uptime}

@router.get("/public/access-code/{code}")
async def validate_access_code(code: str):
    row = await get_interest_by_access_code(code)

    if not row or row.get("user_id") is not None:
        raise HTTPException(status_code=404, detail="Invalid or used access code")

    return {
        "valid": True,
        "email": row.get("email"),
        "name": row.get("name"),
    }

@router.post("/public/access-code/use")
async def use_access_code(request: Request):
    data = await request.json()
    code = data.get("code")
    user_id = data.get("user_id")

    if not code or not user_id:
        raise HTTPException(status_code=400, detail="Missing code or user_id")

    row = await get_interest_by_access_code(code)

    if not row or row.get("user_id") is not None:
        raise HTTPException(status_code=404, detail="Invalid or already used code")

    await assign_interest_user(code, user_id)

    return {"success": True}

