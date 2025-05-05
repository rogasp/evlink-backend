# app/api/public.py

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr

from app.enode import get_link_result
from app.storage.interest import save_interest

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
