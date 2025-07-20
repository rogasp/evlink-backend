# Email Notification Service

This document describes the architecture, usage, and template management for the new email notification service.

## 1. Architecture

The email notification service is designed with a layered approach to ensure flexibility, maintainability, and scalability. It consists of:

-   **`EmailService` (backend/app/services/email/email_service.py):** This is the primary abstraction layer. It is responsible for:
    -   Fetching email templates from the database (`email_templates` table).
    -   Populating templates with dynamic data (e.g., user names, event-specific details).
    -   Determining the correct recipient and language.
    -   Delegating the actual email sending to a specific email provider service (e.g., `BrevoEmailService`).

-   **`BrevoEmailService` (backend/app/services/email/brevo_service.py):** This service handles the direct integration with the Brevo API. It is responsible for:
    -   Configuring the Brevo API client.
    -   Constructing and sending transactional email requests to Brevo.
    -   Logging success and failure of email sending operations.
    -   **Abstraction Benefit:** If we ever need to switch email providers (e.g., to SendGrid), we would only need to create a new service (e.g., `SendGridEmailService`) implementing the same interface and update `EmailService` to use it, without affecting other parts of the application.

-   **`email_templates` Database Table:** This table stores all email subjects, HTML content, and plain text content. It supports multiple languages for each template.
    -   **Location:** Defined in `supabase/sql_definitions/create_email_templates_table.sql`.
    -   **Columns:** `template_name` (unique identifier), `subject`, `html_body`, `text_body`, `language_code`.
    -   **RLS:** Configured to allow authenticated users to read templates (for potential future frontend use, though primarily for backend).

-   **Admin API Endpoint (backend/app/api/admin/email.py):** An admin-only endpoint (`POST /admin/email/send`) is provided for manually triggering email sends. This is useful for testing, debugging, and administrative tasks.

## 2. Usage

### 2.1. Sending an Email from a Template

To send an email from any part of the backend application, you can use the `EmailService`:

```python
from app.services.email.email_service import EmailService

async def send_welcome_email_to_new_user(user_id: str, user_name: str, user_email: str):
    email_service = EmailService(user_id=user_id)
    await email_service.send_email_from_template(
        template_name="welcome_email",
        language_code="en", # Or "sv", or dynamically determined
        template_data={
            "name": user_name, # This will replace {{name}} in the template
            "email": user_email # Example of another dynamic field
        }
    )

# Example usage (e.g., in a user registration flow)
# await send_welcome_email_to_new_user("some-user-id", "John Doe", "john.doe@example.com")
```

**Parameters for `send_email_from_template`:**

-   `template_name` (str): The unique name of the template as defined in the `email_templates` table (e.g., `"welcome_email"`).
-   `template_data` (dict, optional): A dictionary of key-value pairs to replace placeholders in the template. Placeholders in the template should be in the format `{{key}}` (e.g., `{{name}}`).
-   `language_code` (str, optional): The desired language for the email (e.g., `"en"`, `"sv"`). Defaults to `"en"`. If a template is not found for the specified language, it will fall back to the English version if available.

### 2.2. Admin API Endpoint for Manual Sending

For testing and administrative purposes, an endpoint is available:

-   **URL:** `/admin/email/send`
-   **Method:** `POST`
-   **Authentication:** Requires an admin JWT token.
-   **Request Body (JSON):**

    ```json
    {
        "user_id": "<UUID_OF_RECIPIENT_USER>",
        "template_name": "welcome_email",
        "language_code": "en",
        "template_data": {
            "name": "Recipient Name"
        }
    }
    ```

## 3. Adding New Email Templates

To add a new email template:

1.  **Define the Template in SQL:**
    Add `INSERT` statements to the `supabase/sql_definitions/create_email_templates_table.sql` file. Ensure you provide entries for all supported languages (`en`, `sv`).

    Example for a new `"password_reset"` template:

    ```sql
    INSERT INTO public.email_templates (template_name, subject, html_body, text_body, language_code)
    VALUES 
        ('password_reset', 'Password Reset Request', '<h1>Reset Your Password</h1><p>Click here to reset: {{reset_link}}</p>', 'Reset your password: {{reset_link}}', 'en'),
        ('password_reset', 'Begäran om lösenordsåterställning', '<h1>Återställ ditt lösenord</h1><p>Klicka här för att återställa: {{reset_link}}</p>', 'Återställ ditt lösenord: {{reset_link}}', 'sv')
    ON CONFLICT (template_name, language_code) DO NOTHING;
    ```

2.  **Run the SQL Migration:**
    Execute the `create_email_templates_table.sql` script against your development database (and later, staging/production) to add the new templates.

3.  **Use the Template in Code:**
    Refer to the template by its `template_name` when calling `EmailService.send_email_from_template()`.

## 4. Handling Dynamic Content (Placeholders)

The current implementation uses a basic string replacement for placeholders (e.g., `{{name}}`). For more complex scenarios, such as iterating over lists or conditional rendering, a more robust templating engine (like Jinja2 in Python) would be required. This is noted as a future improvement.

When adding new templates, ensure that:
-   Placeholders are clearly defined using the `{{key}}` syntax.
-   The `template_data` dictionary passed to `send_email_from_template` contains all necessary keys to populate the template.

This guide provides a comprehensive overview of the email notification service. For any further questions or enhancements, please refer to the relevant code files or create a new GitHub issue.