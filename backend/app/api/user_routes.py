from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict
from app.security import get_current_user
from app.enode import create_link_session

router = APIRouter()

class LinkVehicleRequest(BaseModel):
    vendor: str

class LinkVehicleResponse(BaseModel):
    url: str
    linkToken: str 

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

        session = await create_link_session(user_id=user_id, vendor=request.vendor)

        if "linkUrl" not in session or "linkToken" not in session:
            raise HTTPException(status_code=500, detail="Missing 'linkUrl' or 'linkToken' in Enode response")

        return LinkVehicleResponse(
            url=session["linkUrl"],
            linkToken=session["linkToken"]
        )

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create link session: {str(e)}")
