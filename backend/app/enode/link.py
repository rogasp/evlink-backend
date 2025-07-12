import httpx
import logging
from app.config import ENODE_BASE_URL, REDIRECT_URI, USE_MOCK
from app.enode.auth import get_access_token

logger = logging.getLogger(__name__)

async def get_link_result(link_token: str) -> dict:
    """Retrieves the result of an Enode linking session using the provided link token."""
    if USE_MOCK:
        logger.debug("[MOCK] get_link_result active")
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
    """Creates a new Enode linking session for a given user and optional vendor."""
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
