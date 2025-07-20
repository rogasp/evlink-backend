# backend/app/api/internal.py

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.dependencies.auth import get_internal_api_key
from app.services.email.email_service import EmailService

logger = logging.getLogger(__name__)
router = APIRouter()

class SendTrialReminderRequest(BaseModel):
    user_id: str
    days_left: int

@router.post("/internal/send-trial-reminder", status_code=status.HTTP_200_OK)
async def send_trial_reminder(
    request: SendTrialReminderRequest,
    api_key: str = Depends(get_internal_api_key),
):
    """
    Internal endpoint to trigger a trial expiration reminder email.
    Secured by an internal API key.
    """
    logger.info(f"Internal API key used to send trial reminder for user {request.user_id} (days left: {request.days_left}).")
    
    try:
        email_service = EmailService(user_id=request.user_id)
        # We will need a new template for trial reminders
        template_name = f"trial_reminder_{request.days_left}_days"
        
        await email_service.send_email_from_template(
            template_name=template_name,
            language_code="en", # Or dynamically determined based on user preference
            template_data={
                "days_left": request.days_left
            }
        )
        return {"message": "Trial reminder email triggered successfully."}
    except Exception as e:
        logger.error(f"Failed to send trial reminder email for user {request.user_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while triggering the trial reminder email.",
        )
