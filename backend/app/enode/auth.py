import time
import httpx
from app.config import ENODE_AUTH_URL, CLIENT_ID, CLIENT_SECRET

_token_cache = {"access_token": None, "expires_at": 0}

async def get_access_token():
    """Retrieves and caches the Enode API access token."""
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
