import os
import json
import time
import httpx
import datetime
import hmac, hashlib

from dotenv import load_dotenv
from fastapi import HTTPException

from app.config import (
    ENODE_BASE_URL,
    ENODE_AUTH_URL,
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
    WEBHOOK_URL,
    ENODE_WEBHOOK_SECRET,
    USE_MOCK
)

_token_cache = {"access_token": None, "expires_at": 0}

async def get_access_token():
    if _token_cache["access_token"] and _token_cache["expires_at"] > time.time():
        return _token_cache["access_token"]

    async with httpx.AsyncClient() as client:
        response = await client.post(
            ENODE_AUTH_URL,
            data={"grant_type": "client_credentials"},
            auth=(CLIENT_ID, CLIENT_SECRET),
        )
        response.raise_for_status()
        token_data = response.json()
        _token_cache["access_token"] = token_data["access_token"]
        _token_cache["expires_at"] = time.time() + token_data.get("expires_in", 3600) - 60
        return _token_cache["access_token"]

async def get_user_vehicles_enode(user_id: str) -> list:
    access_token = await get_access_token()
    url = f"{ENODE_BASE_URL}/users/{user_id}/vehicles"
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers)
        res.raise_for_status()
        return res.json().get("data", [])
