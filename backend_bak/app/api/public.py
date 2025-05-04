# backend/app/api/public.py

import asyncio
import os
from fastapi import APIRouter, HTTPException, Depends, Request, Response, Path
from pydantic import BaseModel, EmailStr, Field

from app.schemas.auth import RegisterRequest
from app.storage.user import get_user_by_email
from app.storage.apikey import create_api_key, get_api_key_info
from app.storage.interest import save_interest
from app.enode import get_link_result, USE_MOCK
from app.auth.supabase_auth import get_supabase_user
from app.lib.supabase import supabase_admin  # 🔄 ändrad import

router = APIRouter()

SECURE_COOKIES = os.getenv("SECURE_COOKIES", "false").lower() == "true"


class RegisterInput(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr

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

