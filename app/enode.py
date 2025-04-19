import os
import httpx
from dotenv import load_dotenv

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


async def get_vehicle_data(vehicle_id: str) -> dict:
    token = await get_access_token()
    headers = {"Authorization": f"Bearer {token}"}
    url = f"{ENODE_BASE_URL}/vehicles/{vehicle_id}"

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            charge = data.get("chargeState", {})
            return {
                "battery": charge.get("batteryLevel"),
                "range": charge.get("range"),
                "is_charging": charge.get("isCharging"),
                "charge_rate": charge.get("chargeRate"),
                "plugged_in": charge.get("isPluggedIn"),
                "updated_at": charge.get("lastUpdated"),
                "display_name": data.get("information", {}).get("displayName"),
                "vin": data.get("information", {}).get("vin"),
                "odometer": data.get("odometer", {}).get("distance")
            }
        return {}


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
