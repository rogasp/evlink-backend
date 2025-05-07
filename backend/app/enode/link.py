import httpx
from app.config import ENODE_BASE_URL, REDIRECT_URI, USE_MOCK
from app.enode.auth import get_access_token

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
