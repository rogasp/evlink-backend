import json
import os
import httpx
from dotenv import load_dotenv
from app.storage import get_cached_vehicle, cache_vehicle_data, is_recent
from datetime import datetime

load_dotenv()

ENODE_BASE_URL = os.getenv("ENODE_BASE_URL")
ENODE_AUTH_URL = os.getenv("ENODE_AUTH_URL")
CLIENT_ID = os.getenv("ENODE_CLIENT_ID")
CLIENT_SECRET = os.getenv("ENODE_CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")
USE_MOCK = os.getenv("MOCK_LINK_RESULT", "false").lower() == "true"

_token_cache = {"access_token": None, "expires_at": 0}


async def get_access_token():
    import time
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
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    url = f"{ENODE_BASE_URL}/vehicles/{vehicle_id}"

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)

    if response.status_code == 200:
        print(f"📦 Hämtade fordon {vehicle_id} från Enode")
        return response.json()
    else:
        print(f"❌ Misslyckades att hämta {vehicle_id} – {response.status_code}")
        return None


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
            "userId": "rogasp",
            "vendor": "XPENG"
        }

    # real API call

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

async def subscribe_to_webhooks():
    access_token = await get_access_token()
    webhook_url = os.getenv("WEBHOOK_URL")

    if not webhook_url:
        raise ValueError("WEBHOOK_URL is not set in .env")

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "url": webhook_url,
        "secret": os.getenv("WEBHOOK_SECRET"),  # 👈 nyckel som du väljer och sparar i .env
        "events": [
            "user:vehicle:discovered",
            "user:vehicle:updated"
        ]
    }
    print(payload)
    url = f"{ENODE_BASE_URL}/webhooks"

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)

        # 🔍 DEBUG RESPONSE
        print("[ENODE RESPONSE STATUS]", response.status_code)
        print("[ENODE RESPONSE BODY]", response.text)

        # Raise exception if not 2xx
        response.raise_for_status()

        return response.json()

async def get_vehicle_status(vehicle_id: str, max_age_minutes: int = 5, force: bool = False):
    if not force:
        cached_json = get_cached_vehicle(vehicle_id)
        if cached_json:
            vehicle = json.loads(cached_json)
            updated_at = vehicle.get("updatedAt") or vehicle.get("lastSeen")
            if updated_at and is_recent(updated_at, max_age_minutes):
                print(f"✅ Använder cache för fordon {vehicle_id}")
                return vehicle
            else:
                print(f"🔄 Cache för gammal för {vehicle_id}, hämtar ny...")

    # ⬇ Hämta från Enode oavsett (om force=True eller cache saknas/gammal)
    fresh = await get_vehicle_data(vehicle_id)
    if fresh:
        updated_at = fresh.get("updatedAt") or fresh.get("lastSeen") or datetime.utcnow().isoformat()
        cache_vehicle_data(vehicle_id, json.dumps(fresh), updated_at)
        return fresh

    raise ValueError("Kunde inte hämta fordon från cache eller Enode")

