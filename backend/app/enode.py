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

async def get_all_users(page_size: int = 50, after: str | None = None):
    access_token = await get_access_token()
    headers = {"Authorization": f"Bearer {access_token}"}

    params = {"pageSize": str(page_size)}
    if after:
        params["after"] = after

    url = f"{ENODE_BASE_URL}/users"
    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers, params=params)
        res.raise_for_status()
        return res.json()

async def get_all_vehicles(page_size: int = 50, after: str | None = None):
    access_token = await get_access_token()
    headers = {"Authorization": f"Bearer {access_token}"}

    params = {"pageSize": str(page_size)}
    if after:
        params["after"] = after

    url = f"{ENODE_BASE_URL}/vehicles"
    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers, params=params)
        res.raise_for_status()
        return res.json()

async def fetch_enode_webhook_subscriptions():
    access_token = await get_access_token()
    headers = {"Authorization": f"Bearer {access_token}"}
    url = f"{ENODE_BASE_URL}/webhooks"

    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers)
        res.raise_for_status()
        return res.json().get("data", [])

async def subscribe_to_webhooks():
    access_token = await get_access_token()
    
    if not WEBHOOK_URL:
        raise ValueError("WEBHOOK_URL is not set in .env")
    if not ENODE_WEBHOOK_SECRET:
        raise ValueError("ENODE_WEBHOOK_SECRET is not set in .env")

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "url": WEBHOOK_URL,
        "secret": ENODE_WEBHOOK_SECRET,
        "events": [
            "user:vehicle:discovered",
            "user:vehicle:updated"
        ]
    }

    url = f"{ENODE_BASE_URL}/webhooks"
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)
        print("[📡 ENODE] Webhook subscription status:", response.status_code)
        print("[📡 ENODE] Webhook subscription response:", response.text)
        response.raise_for_status()
        return response.json()

async def delete_webhook(webhook_id: str):
    access_token = await get_access_token()
    headers = {"Authorization": f"Bearer {access_token}"}

    async with httpx.AsyncClient() as client:
        response = await client.delete(f"{ENODE_BASE_URL}/webhooks/{webhook_id}", headers=headers)
        if response.status_code == 204:
            return {"deleted": True}
        response.raise_for_status()

async def delete_enode_user(user_id: str):
    access_token = await get_access_token()
    headers = {"Authorization": f"Bearer {access_token}"}
    url = f"{ENODE_BASE_URL}/users/{user_id}"

    async with httpx.AsyncClient() as client:
        res = await client.delete(url, headers=headers)
        return res.status_code
    
