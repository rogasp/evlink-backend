# backend/app/api/admin/interest.py

import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from app.auth.supabase_auth import get_supabase_user
from app.services.email_utils import send_access_invite_email, send_interest_email
from app.storage.interest import (
    get_uncontacted_interest_entries,
    mark_interest_contacted,
    generate_codes_for_interest_ids,
    get_interest_by_id,
    list_interest_entries,
    count_uncontacted_interest,
)

logger = logging.getLogger(__name__)

router = APIRouter()

def require_admin(user=Depends(get_supabase_user)):
    logger.info("🔍 Admin check - Full user object:")
    # logger.info(user)

    role = user.get("user_metadata", {}).get("role")
    logger.info(f"🔐 Extracted role: {role}")

    if role != "admin":
        logger.warning(f"⛔ Access denied: user {user['id']} with role '{role}' tried to access admin route")
        raise HTTPException(status_code=403, detail="Admin access required")

    logger.info(f"✅ Admin access granted to user {user['id']}")
    return user

@router.post("/admin/interest/contact")
async def contact_all_interested(user=Depends(require_admin)):
    entries = await get_uncontacted_interest_entries()
    contacted = 0

    for entry in entries:
        try:
            await send_interest_email(email=entry["email"], name=entry.get("name", "friend"))
            await mark_interest_contacted(entry["id"])
            contacted += 1
        except Exception as e:
            logger.error(f"[❌] Could not contact {entry['email']}: {e}")

    return {"message": f"Contacted {contacted} interest submissions."}

@router.get("/admin/interest")
async def list_interest(user=Depends(require_admin)):
    return await list_interest_entries()

@router.get("/admin/interest/uncontacted/count")
async def count_interest(user=Depends(require_admin)):
    count = await count_uncontacted_interest()
    return {"count": count}

@router.post("/admin/interest/generate-codes")
async def generate_interest_codes(request: Request, user=Depends(require_admin)):
    data = await request.json()
    interest_ids = data.get("interest_ids", [])

    if not interest_ids or not isinstance(interest_ids, list):
        raise HTTPException(status_code=400, detail="Missing interest_ids")

    updated = await generate_codes_for_interest_ids(interest_ids)

    return {"updated": updated}

@router.post("/admin/interest/send-codes")
async def send_access_invites(request: Request, user=Depends(require_admin)):
    data = await request.json()
    interest_ids = data.get("interest_ids", [])

    if not interest_ids or not isinstance(interest_ids, list):
        raise HTTPException(status_code=400, detail="Missing interest_ids")

    sent = 0

    for interest_id in interest_ids:
        result = await get_interest_by_id(interest_id)

        if not result:
            continue

        # Skip if already linked to user or no access_code
        if result.get("user_id") or not result.get("access_code"):
            continue

        try:
            await send_access_invite_email(
                email=result["email"],
                name=result["name"] or "there",
                code=result["access_code"]
            )
            sent += 1
        except Exception as e:
            logger.error(f"[❌] Failed to send to {result['email']}: {e}")

    return {"sent": sent}
