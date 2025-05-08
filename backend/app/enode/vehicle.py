import httpx
from app.config import ENODE_BASE_URL
from app.enode.auth import get_access_token

async def get_all_vehicles(page_size: int = 50, after: str | None = None):
    token = await get_access_token()
    headers = {"Authorization": f"Bearer {token}"}
    params = {"pageSize": str(page_size)}
    if after:
        params["after"] = after
    url = f"{ENODE_BASE_URL}/vehicles"
    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers, params=params)
        res.raise_for_status()
        return res.json()
