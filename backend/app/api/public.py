import asyncio
import os
from fastapi import APIRouter, HTTPException, Depends, Request, Response, Path
from pydantic import BaseModel, EmailStr, Field

from app.schemas.auth import RegisterRequest
from app.storage.user import get_user_by_email
from app.storage.apikey import create_api_key, get_api_key_info
from app.storage.interest import save_interest
from app.enode import get_link_result, USE_MOCK
from app.lib.supabase import supabase
from app.auth.supabase_auth import get_supabase_user

router = APIRouter()

SECURE_COOKIES = os.getenv("SECURE_COOKIES", "false").lower() == "true"


class RegisterInput(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr


class InterestSubmission(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr


@router.get("/status")
async def status_check():
    return {"status": "ok"}


@router.get("/ping")
async def ping():
    return {"message": "pong"}


@router.post("/register")
async def register_user(data: RegisterInput, request: Request):
    try:
        # ✅ Skapa användaren via Supabase Admin API (utan lösenord)
        result = supabase.auth.admin.create_user({
            "email": data.email,
            "email_confirm": True,
            "user_metadata": {"name": data.name}
        })

        if not result.user:
            raise HTTPException(status_code=500, detail="Failed to create user")

        return {"message": "Registration successful"}
    except Exception as e:
        print(f"❌ Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")


@router.post("/users/{user_id}/apikey")
async def create_user_api_key(user_id: str = Path(...)):
    raw_key = create_api_key(user_id)
    return {"api_key": raw_key}


@router.get("/users/{user_id}/apikey")
async def get_user_api_key_info(user_id: str = Path(...)):
    info = get_api_key_info(user_id)

    if info:
        return {
            "api_key_masked": "***************",
            "created_at": info["created_at"]
        }
    else:
        return {"api_key_masked": None}


@router.post("/user/link-result", response_model=dict)
async def post_link_result(data: dict, user=Depends(get_supabase_user)):
    link_token = data.get("linkToken")
    if not link_token:
        raise HTTPException(status_code=400, detail="Missing linkToken")

    result = await get_link_result(link_token)

    print(f"🔍 Backend received: result.userId = {result.get('userId')}, session.user.id = {user.id}")

    if not USE_MOCK and result.get("userId") != user.id:
        raise HTTPException(status_code=403, detail="Unauthorized result")

    return {
        "vendor": result.get("vendor"),
        "userId": result.get("userId"),
        "status": "linked"
    }


@router.post("/interest")
async def submit_interest(data: InterestSubmission, request: Request):
    try:
        save_interest(data.name, data.email)
        return {"message": "Thanks! We'll notify you when we launch."}
    except Exception as e:
        print(f"❌ Interest submission error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
