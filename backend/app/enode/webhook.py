import httpx
from app.config import ENODE_BASE_URL, WEBHOOK_URL, ENODE_WEBHOOK_SECRET
from app.enode.auth import get_access_token

async def fetch_enode_webhook_subscriptions():
    token = await get_access_token()
    headers = {"Authorization": f"Bearer {token}"}
    url = f"{ENODE_BASE_URL}/webhooks"
    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers)
        res.raise_for_status()
        return res.json().get("data", [])

async def subscribe_to_webhooks():
    token = await get_access_token()
    if not WEBHOOK_URL:
        raise ValueError("WEBHOOK_URL is not set in .env")
    if not ENODE_WEBHOOK_SECRET:
        raise ValueError("ENODE_WEBHOOK_SECRET is not set in .env")

    headers = {
        "Authorization": f"Bearer {token}",
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
    token = await get_access_token()
    headers = {"Authorization": f"Bearer {token}"}
    url = f"{ENODE_BASE_URL}/webhooks/{webhook_id}"
    async with httpx.AsyncClient() as client:
        response = await client.delete(url, headers=headers)
        if response.status_code == 204:
            return {"deleted": True}
        response.raise_for_status()
