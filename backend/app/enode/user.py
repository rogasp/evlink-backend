import httpx
from app.config import ENODE_BASE_URL
from app.enode.auth import get_access_token

async def get_user_vehicles_enode(user_id: str) -> list:
    token = await get_access_token()
    url = f"{ENODE_BASE_URL}/users/{user_id}/vehicles"
    headers = {"Authorization": f"Bearer {token}"}
    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers)
        res.raise_for_status()
        return res.json().get("data", [])

async def get_all_users(page_size: int = 50, after: str | None = None):
    token = await get_access_token()
    headers = {"Authorization": f"Bearer {token}"}
    params = {"pageSize": str(page_size)}
    if after:
        params["after"] = after
    url = f"{ENODE_BASE_URL}/users"
    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers, params=params)
        res.raise_for_status()
        return res.json()

async def delete_enode_user(user_id: str):
    token = await get_access_token()
    headers = {"Authorization": f"Bearer {token}"}
    url = f"{ENODE_BASE_URL}/users/{user_id}"
    async with httpx.AsyncClient() as client:
        res = await client.delete(url, headers=headers)
        return res.status_code

async def unlink_vendor(user_id: str, vendor: str) -> tuple[bool, str | None]:
    token = await get_access_token()
    url = f"{ENODE_BASE_URL}/users/{user_id}/vendors/{vendor}"
    headers = {
        "Authorization": f"Bearer {token}",
    }

    async with httpx.AsyncClient() as client:
        res = await client.delete(url, headers=headers)

    if res.status_code == 204:
        return True, None

    return False, res.text