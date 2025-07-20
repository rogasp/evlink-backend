# backend/app/services/email/brevo_service.py

import logging
from brevo_python import Configuration, ApiClient, TransactionalEmailsApi
from brevo_python.rest import ApiException
from brevo_python.models import SendSmtpEmail, SendSmtpEmailSender, SendSmtpEmailTo

from app.config import BREVO_API_KEY, FROM_EMAIL, FROM_NAME

logger = logging.getLogger(__name__)

if not BREVO_API_KEY:
    raise RuntimeError("BREVO_API_KEY must be set in .env")

class BrevoEmailService:
    """Service for sending transactional emails using the Brevo API."""

    def __init__(self):
        config = Configuration()
        config.api_key["api-key"] = BREVO_API_KEY
        api_client = ApiClient(config)
        self.api_instance = TransactionalEmailsApi(api_client)

    async def send_transactional_email(
        self,
        recipient_email: str,
        recipient_name: str | None,
        subject: str,
        html_content: str,
        text_content: str,
    ) -> bool:
        """Sends a transactional email.

        Args:
            recipient_email: The recipient's email address.
            recipient_name: The recipient's name.
            subject: The email subject.
            html_content: The HTML body of the email.
            text_content: The plain text body of the email.

        Returns:
            True if the email was sent successfully, False otherwise.
        """
        sender = SendSmtpEmailSender(name=FROM_NAME, email=FROM_EMAIL)
        to = [SendSmtpEmailTo(email=recipient_email, name=recipient_name)]

        smtp_email = SendSmtpEmail(
            sender=sender,
            to=to,
            subject=subject,
            html_content=html_content,
            text_content=text_content,
        )

        try:
            self.api_instance.send_transac_email(smtp_email)
            logger.info(f"Successfully sent email to {recipient_email} with subject '{subject}'.")
            return True
        except ApiException as e:
            logger.error(f"Failed to send email to {recipient_email}: {e}")
            return False
