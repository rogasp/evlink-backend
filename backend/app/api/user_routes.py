from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Dict
from app.security import get_current_user # beroende för JWT (du kanske redan har denna)
from app.enode import create_link_session

import secrets

router = APIRouter()

# Example: Mock Enode linking URL
# ENODE_LINK_URL_BASE = "https://link.enode.com/start"

class LinkVehicleRequest(BaseModel):
    vendor: str

class LinkVehicleResponse(BaseModel):
    url: str

@router.post("/user/link-vehicle", response_model=LinkVehicleResponse)
async def api_create_link_session(
    request: LinkVehicleRequest,
    user: dict = Depends(get_current_user),
):
    """
    Create a linking session for a vehicle vendor via Enode v3
    """
    try:
        user_id = user["sub"]

        # Skapa session
        session = await create_link_session(user_id=user_id, vendor=request.vendor)

        # (Frivilligt) Spara linked vendor i din egen databas
        # save_linked_vendor(user_id, request.vendor)

        if "linkUrl" not in session:
            raise HTTPException(status_code=500, detail="Missing 'linkUrl' in Enode link session response")

        return LinkVehicleResponse(url=session["linkUrl"])

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create link session: {str(e)}")
