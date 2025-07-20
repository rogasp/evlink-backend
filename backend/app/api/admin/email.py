# backend/app/api/admin/email.py

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.auth.supabase_auth import get_supabase_user
from app.services.email.email_service import EmailService

logger = logging.getLogger(__name__)
router = APIRouter()

class SendEmailRequest(BaseModel):
    user_id: str
    template_name: str
    language_code: str = 'en'
    template_data: dict | None = None

def require_admin(user=Depends(get_supabase_user)):
    role = user.get("user_metadata", {}).get("role")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@router.post("/admin/email/send", status_code=status.HTTP_200_OK)
async def send_email(
    request: SendEmailRequest,
    admin_user: dict = Depends(require_admin),
):
    """
    An admin-only endpoint to manually trigger an email to a user.
    """
    admin_id = admin_user.get('id')
    logger.info(f"Admin user {admin_id} initiating email send for user {request.user_id}.")
    
    try:
        email_service = EmailService(user_id=request.user_id)
        await email_service.send_email_from_template(
            template_name=request.template_name,
            template_data=request.template_data,
            language_code=request.language_code,
        )
        return {"message": "Email sent successfully."}
    except Exception as e:
        logger.error(f"Failed to send email from admin endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while sending the email.",
        )
