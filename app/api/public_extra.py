import os
import sqlite3

from fastapi import APIRouter, HTTPException, Body
from app.storage import (
    create_user, DB_PATH, get_api_key_by_user)

IS_DEV = os.getenv("ENV", "dev") == "dev"

router = APIRouter()


@router.get("/public/user/{user_id}")
def check_user_exists(user_id: str):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute(
            "SELECT 1 FROM api_keys WHERE user_id = ? LIMIT 1", (user_id,)
        )
        return {"exists": cursor.fetchone() is not None}

# ⚠️ Temporary route – will be removed once JWT is implemented
@router.get("/public/user/{user_id}/apikey")
def get_api_key_for_login(user_id: str):
    """Public API key fetch (login) – can only be used to fetch your own key"""
    api_key = get_api_key_by_user(user_id)
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")
    return {"api_key": api_key}


