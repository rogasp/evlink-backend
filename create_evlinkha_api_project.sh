#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
NEW_SERVICE_NAME="evlinkha-api"
PROJECT_ROOT="/home/roger/dev/evlink-backend"
NEW_SERVICE_DIR="$PROJECT_ROOT/$NEW_SERVICE_NAME"

echo "--- Setting up new service: $NEW_SERVICE_NAME ---"

# 1. Create project directory
if [ -d "$NEW_SERVICE_DIR" ]; then
    echo "Directory $NEW_SERVICE_DIR already exists. Skipping creation."
else
    echo "Creating directory: $NEW_SERVICE_DIR"
    mkdir -p "$NEW_SERVICE_DIR/app/api"
    mkdir -p "$NEW_SERVICE_DIR/app/dependencies"
    mkdir -p "$NEW_SERVICE_DIR/app/services/email"
    mkdir -p "$NEW_SERVICE_DIR/app/storage"
    mkdir -p "$NEW_SERVICE_DIR/app/lib"
    echo "Directory structure created."
fi

# 2. Create requirements.txt
echo "Creating requirements.txt..."
cat << EOF > "$NEW_SERVICE_DIR/requirements.txt"
fastapi
uvicorn
python-dotenv
supabase
httpx
pydantic
brevo-python
EOF
echo "requirements.txt created."

# 3. Create .env.example
echo "Creating .env.example..."
cat << EOF > "$NEW_SERVICE_DIR/.env.example"
SUPABASE_URL="your_supabase_url"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
INTERNAL_API_KEY="a_strong_internal_api_key"
BREVO_API_KEY="your_brevo_api_key"
FROM_EMAIL="noreply@evlinkha.se"
FROM_NAME="EVLinkHA"
EOF
echo ".env.example created."

# 4. Create README.md
echo "Creating README.md..."
cat << EOF > "$NEW_SERVICE_DIR/README.md"
# $NEW_SERVICE_NAME

This service handles internal API calls for EVLinkHA, starting with trial reminder emails.

## Setup

1.  **Install dependencies:**
    ```bash
    cd $NEW_SERVICE_NAME
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    ```

2.  **Configure environment variables:**
    Copy `.env.example` to `.env` and fill in your Supabase and Brevo credentials, and generate a strong `INTERNAL_API_KEY`.

3.  **Run the application:**
    ```bash
    uvicorn app.main:app --host 0.0.0.0 --port 8000
    ```
EOF
echo "README.md created."

# 5. Populate core application files

# app/main.py
echo "Populating app/main.py..."
cat << EOF > "$NEW_SERVICE_DIR/app/main.py"
import logging
from fastapi import FastAPI
from app.api.internal import router as internal_router
from app.logger import logger

logger.info("🚀 Starting $NEW_SERVICE_NAME...")

app = FastAPI(
    title="$NEW_SERVICE_NAME",
    version="0.1.0",
    description="Internal API service for EVLinkHA.",
)

app.include_router(internal_router, prefix="/api/v1")
EOF

# app/config.py
echo "Populating app/config.py..."
cat << EOF > "$NEW_SERVICE_DIR/app/config.py"
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY")

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@evlinkha.se")
FROM_NAME = os.getenv("FROM_NAME", "EVLinkHA")
EOF

# app/logger.py (minimal)
echo "Populating app/logger.py..."
cat << EOF > "$NEW_SERVICE_DIR/app/logger.py"
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
EOF

# app/dependencies/auth.py
echo "Populating app/dependencies/auth.py..."
cat << EOF > "$NEW_SERVICE_DIR/app/dependencies/auth.py"
from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader
from app.config import INTERNAL_API_KEY

internal_api_key_header = APIKeyHeader(name="X-Internal-API-Key", auto_error=False)

async def get_internal_api_key(api_key: str = Security(internal_api_key_header)) -> str:
    if not INTERNAL_API_KEY or api_key != INTERNAL_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid internal API key")
    return api_key
EOF

# app/api/internal.py
echo "Populating app/api/internal.py..."
cat << EOF > "$NEW_SERVICE_DIR/app/api/internal.py"
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.dependencies.auth import get_internal_api_key
from app.services.email.email_service import EmailService
from app.storage.user import get_user_by_id # Ensure this is imported

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
EOF

# app/services/email/brevo_service.py
echo "Populating app/services/email/brevo_service.py..."
cat << EOF > "$NEW_SERVICE_DIR/app/services/email/brevo_service.py"
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
EOF

# app/services/email/email_service.py
echo "Populating app/services/email/email_service.py..."
cat << EOF > "$NEW_SERVICE_DIR/app/services/email/email_service.py"
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
EOF

# app/storage/email.py
echo "Populating app/storage/email.py..."
cat << EOF > "$NEW_SERVICE_DIR/app/storage/email.py"
import logging
from app.lib.supabase import get_supabase_admin_async_client
from postgrest import APIError

logger = logging.getLogger(__name__)

async def get_email_template(template_name: str, language_code: str) -> dict | None:
    """
    Fetches a specific email template from the database.

    Args:
        template_name: The name of the template (e.g., 'welcome_email').
        language_code: The language code for the template (e.g., 'en', 'sv').

    Returns:
        A dictionary containing the template's subject, html_body, text_body, and is_one_off,
        or None if the template is not found.
    """
    supabase_client = await get_supabase_admin_async_client()
    try:
        response = await (
            supabase_client.table("email_templates")
            .select("subject, html_body, text_body, is_one_off")
            .eq("template_name", template_name)
            .eq("language_code", language_code)
            .limit(1)
            .single()
            .execute()
        )
        
        if response.data:
            logger.info(f"Successfully fetched email template '{template_name}' in '{language_code}'.")
            return response.data
        else:
            logger.warning(f"No email template found for '{template_name}' in '{language_code}'.")
            return None

    except APIError as e:
        logger.error(f"Error fetching email template '{template_name}': {e.message}")
        return None
    except Exception as e:
        logger.error(f"An unexpected error occurred while fetching email template '{template_name}': {e}")
        return None

async def has_email_been_sent(user_id: str, template_name: str) -> bool:
    """
    Checks if a specific one-off email has already been sent to a user.
    """
    supabase_client = await get_supabase_admin_async_client()
    try:
        response = await (
            supabase_client.table("sent_emails")
            .select("id")
            .eq("user_id", user_id)
            .eq("template_name", template_name)
            .limit(1)
            .single()
            .execute()
        )
        return response.data is not None
    except APIError as e:
        if e.code == 'PGRST116': # No rows found
            return False
        logger.error(f"Error checking if email '{template_name}' was sent to user {user_id}: {e.message}")
        return False
    except Exception as e:
        logger.error(f"An unexpected error occurred while checking sent email status for user {user_id}: {e}")
        return False

async def log_sent_email(user_id: str, template_name: str, event_context: dict | None = None):
    """
    Logs that a one-off email has been sent to a user.
    """
    supabase_client = await get_supabase_admin_async_client()
    try:
        data = {
            "user_id": user_id,
            "template_name": template_name,
            "event_context": event_context
        }
        await supabase_client.table("sent_emails").insert(data).execute()
        logger.info(f"Logged sent email '{template_name}' for user {user_id}.")
    except APIError as e:
        logger.error(f"Error logging sent email '{template_name}' for user {user_id}: {e.message}")
    except Exception as e:
        logger.error(f"An unexpected error occurred while logging sent email for user {user_id}: {e}")
EOF

# app/storage/user.py (minimal for get_user_by_id)
echo "Populating app/storage/user.py..."
cat << EOF > "$NEW_SERVICE_DIR/app/storage/user.py"
import logging
from app.lib.supabase import get_supabase_admin_client
from pydantic import BaseModel
from typing import Optional

logger = logging.getLogger(__name__)
supabase = get_supabase_admin_client()

class User(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    # Add other fields if needed by email service, e.g., language_code
    class Config:
        extra = "allow"

async def get_user_by_id(user_id: str) -> User | None:
    """
    Fetch a single user by ID. Returns an instance of `User` model or None.
    """
    try:
        response = supabase.table("users") \
            .select("id, email, name") \
            .eq("id", user_id) \
            .maybe_single() \
            .execute()

        row = response.data
        if not row:
            logger.info(f"[INFO] No user found with id={{user_id}}")
            return None

        user = User(**row)
        logger.info(f"Successfully retrieved user by ID: {{user_id}}")
        return user
    except Exception as e:
        logger.error(f"Error retrieving user by ID {{user_id}}: {{e}}", exc_info=True)
        return None
EOF

# app/lib/supabase.py
echo "Populating app/lib/supabase.py..."
cat << EOF > "$NEW_SERVICE_DIR/app/lib/supabase.py"
from supabase import create_client, create_async_client
from app.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("Missing Supabase URL or service role key.")

async def get_supabase_admin_async_client():
    """
    Creates an ASYNCHRONOUS Supabase client with the service role key, bypassing Row Level Security (RLS).
    """
    return await create_async_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def get_supabase_admin_client():
    """
    Creates a SYNCHRONOUS Supabase client with the service role key, bypassing Row Level Security (RLS).
    """
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
EOF

echo "Application files populated."

# 6. Initialize Git repository
echo "Initializing Git repository in $NEW_SERVICE_DIR..."
cd "$NEW_SERVICE_DIR"
git init
echo "Git repository initialized."

# Create a .gitignore for the new service
echo "Creating .gitignore..."
cat << EOF > "$NEW_SERVICE_DIR/.gitignore"
.env
venv/
__pycache__/
*.pyc
EOF
echo ".gitignore created."

# Add all files to Git and make an initial commit
git add .
git commit -m "feat: Initial commit for evlinkha-api service"
echo "Initial Git commit created."

# 7. Create GitHub repository (placeholder)
echo "--- Next Step: Create GitHub Repository ---"
echo "To create a private GitHub repository, run the following command from within the $NEW_SERVICE_DIR directory:"
echo "gh repo create $NEW_SERVICE_NAME --private --source=. --remote=origin --push"
echo "You will need to have the GitHub CLI (gh) installed and authenticated."
echo ""
echo "--- Setup Complete ---"
echo "You can now navigate to $NEW_SERVICE_DIR, activate the venv, install dependencies, and run the service."
echo "cd $NEW_SERVICE_DIR"
echo "python3 -m venv venv"
echo "source venv/bin/activate"
echo "pip install -r requirements.txt"
echo "uvicorn app.main:app --host 0.0.0.0 --port 8000"
