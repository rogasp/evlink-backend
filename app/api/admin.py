import os
import sqlite3
import json

from fastapi import APIRouter, HTTPException, Depends

from app.security import require_api_key
from app.storage import (
    DB_PATH,
    list_all_api_keys
)

IS_DEV = os.getenv("ENV", "dev") == "dev"

router = APIRouter()

@router.get("/admin/apikeys")
async def list_apikeys(user_id: str = Depends(require_api_key)):
    """List all API keys (admin only)"""
    if user_id != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return list_all_api_keys()

@router.get("/events")
async def list_webhook_events(user_id: str = Depends(require_api_key)):
    """List received webhook events (admin only)"""
    if user_id != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute("SELECT created_at, json FROM webhook_events ORDER BY created_at DESC")
        return [{"created_at": row[0], "data": json.loads(row[1])} for row in cursor.fetchall()]
