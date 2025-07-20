# backend/app/services/email/email_service.py

import logging
from .brevo_service import BrevoEmailService
from app.storage.email import get_email_template, has_email_been_sent, log_sent_email
from app.storage.user import get_user_by_id

logger = logging.getLogger(__name__)

class EmailService:
    """A generic service for sending emails using a provider (e.g., Brevo)."""

    def __init__(self, user_id: str):
        self.user_id = user_id
        self.brevo_service = BrevoEmailService()

    async def send_email_from_template(
        self, 
        template_name: str, 
        template_data: dict | None = None,
        language_code: str = 'en' # Default to English
    ):
        """Fetches a template, populates it with data, and sends the email."""
        
        user = await get_user_by_id(self.user_id)
        if not user:
            logger.error(f"User with ID {self.user_id} not found. Cannot send email.")
            return

        template = await get_email_template(template_name, language_code)

        if not template:
            logger.error(f"Email template '{template_name}' in language '{language_code}' not found.")
            # Fallback to English if the specified language is not found
            if language_code != 'en':
                logger.info(f"Falling back to English for template '{template_name}'.")
                template = await get_email_template(template_name, 'en')
            
            if not template:
                logger.error(f"Fallback English template '{template_name}' also not found.")
                return

        # Check if it's a one-off email and if it has already been sent
        if template.get('is_one_off'):
            if await has_email_been_sent(self.user_id, template_name):
                logger.info(f"One-off email '{template_name}' already sent to user {self.user_id}. Skipping.")
                return

        # Add user's name to template data if not already present
        if not template_data:
            template_data = {}
        if 'name' not in template_data:
            template_data['name'] = user.name if user.name else user.email.split('@')[0]

        # Basic placeholder replacement
        subject = template['subject']
        html_body = template['html_body']
        text_body = template['text_body']

        for key, value in template_data.items():
            subject = subject.replace(f"{{{{{key}}}}}", str(value))
            html_body = html_body.replace(f"{{{{{key}}}}}", str(value))
            text_body = text_body.replace(f"{{{{{key}}}}}", str(value))

        await self.brevo_service.send_transactional_email(
            recipient_email=user.email,
            recipient_name=user.name,
            subject=subject,
            html_content=html_body,
            text_content=text_body,
        )

        # Log the sent email if it's a one-off
        if template.get('is_one_off'):
            await log_sent_email(self.user_id, template_name)

        logger.info(f"Email from template '{template_name}' sent to user {self.user_id}.")
