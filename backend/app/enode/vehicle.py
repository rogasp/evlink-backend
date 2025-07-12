from fastapi import HTTPException
import httpx
from app.config import ENODE_BASE_URL
from app.enode.auth import get_access_token
import logging

logger = logging.getLogger(__name__)

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

async def set_vehicle_charging(vehicle_id: str, action: str) -> dict:
    """
    Starts or stops vehicle charging via the Enode API.
    Raises HTTPException with Enode's status code and response text if an error occurs.
    """
    token = await get_access_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    url = f"{ENODE_BASE_URL}/vehicles/{vehicle_id}/charging"
    payload = {"action": action}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            # Log Enode's error body and re-raise as HTTPException
            text = e.response.text
            status = e.response.status_code
            logger.error(
                "[set_vehicle_charging] Enode returned %d: %s",
                status,
                text,
                exc_info=True
            )
            # Raise a FastAPI HTTPException with the exact same status code and Enode's error text
            raise HTTPException(status_code=status, detail=text)
        except Exception as e:
            logger.error(
                "[set_vehicle_charging] Unexpected error calling Enode: %s",
                e,
                exc_info=True
            )
            raise HTTPException(status_code=502, detail="Unexpected error calling Enode")