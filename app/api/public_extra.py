import os
import sqlite3

from fastapi import APIRouter, HTTPException, Body
from app.storage import (
    create_user, DB_PATH)

IS_DEV = os.getenv("ENV", "dev") == "dev"

router = APIRouter()

@router.post("/register")
async def register_user(payload: dict = Body(...)):
    user_id = payload.get("user_id")
    email = payload.get("email")

    if not user_id:
        raise HTTPException(status_code=400, detail="Missing user_id")

    create_user(user_id, email)
    return {"status": "created", "user_id": user_id}

@router.get("/public/user/{user_id}")
def check_user_exists(user_id: str):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute(
            "SELECT 1 FROM api_keys WHERE user_id = ? LIMIT 1", (user_id,)
        )
        return {"exists": cursor.fetchone() is not None}

@router.get("/public/user/{user_id}/apikey")
def get_api_key_for_login(user_id: str):
    """Public API key fetch (login) – can only be used to fetch your own key"""
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute("SELECT api_key FROM api_keys WHERE user_id = ?", (user_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="API key not found")
        return {"api_key": row[0]}


