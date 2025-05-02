import os
import json
import time
import httpx
import datetime
import hmac, hashlib

from dotenv import load_dotenv
from fastapi import HTTPException

from app.storage.vehicle import get_cached_vehicle, save_vehicle_data, is_newer_data

load_dotenv()

ENODE_BASE_URL = os.getenv("ENODE_BASE_URL")
ENODE_AUTH_URL = os.getenv("ENODE_AUTH_URL")
CLIENT_ID = os.getenv("ENODE_CLIENT_ID")
CLIENT_SECRET = os.getenv("ENODE_CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")
USE_MOCK = os.getenv("MOCK_LINK_RESULT", "false").lower() == "true"

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

async def get_vehicle_data(vehicle_id: str):
    access_token = await get_access_token()
    headers = {"Authorization": f"Bearer {access_token}"}
    url = f"{ENODE_BASE_URL}/vehicles/{vehicle_id}"

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)

    if response.status_code == 200:
        print(f"📦 Hämtade fordon {vehicle_id} från Enode")
        return response.json()
    else:
        print(f"❌ Misslyckades att hämta {vehicle_id} – {response.status_code}")
        return None

async def get_vehicle_status(vehicle_id: str, user_id: str, force: bool = False) -> dict:
    cached = get_cached_vehicle(vehicle_id)

    if cached:
        try:
            cached_user_id = cached.get("userId")
            print(f"🧪 Kontroll: cached.userId = {cached_user_id}, request.userId = {user_id}")

            if cached_user_id != user_id:
                raise HTTPException(status_code=403, detail="Unauthorized vehicle access")

            updated_at = cached.get("updatedAt") or cached.get("lastSeen")
            if updated_at and not force and is_newer_data({"lastSeen": datetime.datetime.now(datetime.UTC).isoformat()}, cached):
                print(f"✅ Använder cache för {vehicle_id}")
                return cached

        except Exception as e:
            print(f"⚠️  Fel vid tolkning av cache: {e}")

    fresh = await get_vehicle_data(vehicle_id)

    if not fresh:
        raise HTTPException(status_code=404, detail=f"Vehicle {vehicle_id} not found")

    fresh["userId"] = user_id
    save_vehicle_data(fresh)

    if fresh.get("userId") != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized vehicle access")

    return fresh

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

async def get_user_vehicles_enode(user_id: str) -> list:
    access_token = await get_access_token()
    url = f"{ENODE_BASE_URL}/users/{user_id}/vehicles"
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers)
        res.raise_for_status()
        return res.json().get("data", [])

async def create_link_session(user_id: str, vendor: str = ""):
    token = await get_access_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {
        "vendorType": "vehicle",
        "language": "en-US",
        "scopes": [
            "vehicle:read:data",
            "vehicle:read:location",
            "vehicle:control:charging"
        ],
        "colorScheme": "system",
        "redirectUri": REDIRECT_URI
    }
    if vendor:
        payload["vendor"] = vendor

    url = f"{ENODE_BASE_URL}/users/{user_id}/link"
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()

async def get_link_result(link_token: str) -> dict:
    if USE_MOCK:
        print("[MOCK] get_link_result active")
        return {
            "userId": "testuser",
            "vendor": "XPENG"
        }

    token = await get_access_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {"linkToken": link_token}

    url = f"{ENODE_BASE_URL}/links/token"
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()

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

async def delete_enode_user(user_id: str):
    access_token = await get_access_token()
    headers = {"Authorization": f"Bearer {access_token}"}
    url = f"{ENODE_BASE_URL}/users/{user_id}"

    async with httpx.AsyncClient() as client:
        res = await client.delete(url, headers=headers)
        return res.status_code

async def subscribe_to_webhooks():
    access_token = await get_access_token()
    webhook_url = os.getenv("WEBHOOK_URL")
    webhook_secret = os.getenv("ENODE_WEBHOOK_SECRET")

    if not webhook_url:
        raise ValueError("WEBHOOK_URL is not set in .env")
    if not webhook_secret:
        raise ValueError("ENODE_WEBHOOK_SECRET is not set in .env")

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "url": webhook_url,
        "secret": webhook_secret,
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

<<<<<<< HEAD
=======
import datetime
from fastapi import HTTPException

# ...

def is_recent(timestamp: str, minutes: int = 5) -> bool:
    try:
        dt = datetime.datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
        return (datetime.datetime.now(datetime.UTC) - dt).total_seconds() < minutes * 60
    except Exception as e:
        print(f"⚠️  Kunde inte tolka timestamp: {timestamp} – {e}")
        return False


async def get_vehicle_status(vehicle_id: str, user_id: str, force: bool = False) -> dict:
    cached = get_cached_vehicle(vehicle_id)

    if cached:
        try:
            data = json.loads(cached)
            cached_user_id = data.get("userId")

            print(f"🧪 Kontroll: cached.userId = {cached_user_id}, request.userId = {user_id}")

            if cached_user_id != user_id:
                print(f"⛔ Fel användare – fordon {vehicle_id} tillhör {cached_user_id}, inte {user_id}")
                raise HTTPException(status_code=403, detail="Unauthorized vehicle access")

            updated_at = data.get("updatedAt") or data.get("lastSeen")
            if updated_at and not force and is_recent(updated_at):
                print(f"✅ Använder cache för {vehicle_id}")
                return data

            print(f"🔄 Cache för gammal eller saknas för {vehicle_id}, hämtar ny...")

        except Exception as e:
            print(f"⚠️  Fel vid tolkning av cache: {e}")

    # Ingen giltig cache – hämta nytt
    fresh = await get_vehicle_data(vehicle_id)

    if not fresh:
        raise HTTPException(status_code=404, detail=f"Vehicle {vehicle_id} not found")

    updated_at = fresh.get("updatedAt") or fresh.get("lastSeen") or datetime.datetime.now(datetime.UTC).isoformat()
    cache_vehicle_data(vehicle_id, json.dumps(fresh), updated_at)

    if fresh.get("userId") != user_id:
        print(f"⛔ Fel användare – live data {vehicle_id} tillhör {fresh.get('userId')}, inte {user_id}")
        raise HTTPException(status_code=403, detail="Unauthorized vehicle access")

    return fresh


async def get_user_vehicles_enode(user_id: str) -> list:
    access_token = await get_access_token()
    url = f"{ENODE_BASE_URL}/users/{user_id}/vehicles"
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers)
        res.raise_for_status()
        return res.json().get("data", [])

>>>>>>> origin/dev
async def get_linked_vendor_details(user_id: str) -> list:
    access_token = await get_access_token()
    url = f"{ENODE_BASE_URL}/users/{user_id}"
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers)
        res.raise_for_status()
        return res.json().get("linkedVendors", [])

async def get_webhooks():
    access_token = await get_access_token()
    headers = {"Authorization": f"Bearer {access_token}"}

    async with httpx.AsyncClient() as client:
        response = await client.get(f"{ENODE_BASE_URL}/webhooks", headers=headers)
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

async def fetch_enode_webhook_subscriptions():
    access_token = await get_access_token()
    headers = {"Authorization": f"Bearer {access_token}"}
    url = f"{ENODE_BASE_URL}/webhooks"

    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers)
        res.raise_for_status()
        return res.json().get("data", [])
