import httpx
import logging

from app.config import FROM_EMAIL, RESEND_API_KEY

logger = logging.getLogger(__name__)

async def send_offline_notification(email: str, name: str, vehicle_name: str):
    html = f"""
    <p>Hi {name},</p>

    <p>Your vehicle <strong>{vehicle_name}</strong> has gone <strong>offline</strong>.</p>

    <p>
      This means EVLinkHA is no longer able to communicate with your vehicle.
      To restore the connection, please link your vehicle again.
    </p>

    <p>
      You can do this by logging into your dashboard at <a href="https://evlinkha.se/dashboard">evlinkha.se/dashboard</a>
      and choosing "Link Vehicle".
    </p>

    <p>– EVLinkHA</p>
    """

    text = f"""Hi {name},

Your vehicle "{vehicle_name}" has gone offline.

This means EVLinkHA can no longer communicate with it.
To restore the connection, please log in at https://evlinkha.se/dashboard and choose "Link Vehicle".

– EVLinkHA
"""

    async with httpx.AsyncClient() as client:
        await client.post(
            "https://api.resend.com/emails",
            json={
                "from": f"EVLinkHA <{FROM_EMAIL}>",
                "to": [email],
                "subject": f"{vehicle_name} is offline",
                "html": html,
                "text": text,
            },
            headers={"Authorization": f"Bearer {RESEND_API_KEY}"}
        )

async def send_access_invite_email(email: str, name: str, code: str):
    registration_url = f"https://evlinkha.se/register/{code}"

    html = f"""
    <p>Hi {name},</p>

    <p>
    You’ve been invited to register for <strong>EVLinkHA</strong> and take part in our
    <strong>public beta</strong>.
    </p>

    <p>
    As this is a beta version, some features may be incomplete, temporarily unavailable, or subject to change.
    Your feedback is incredibly valuable to us.
    </p>

    <p>
    Click the link below to begin your registration:<br />
    <a href="{registration_url}">{registration_url}</a>
    </p>

    <p>
    <strong>Note:</strong> This access code can only be used once. Please don’t share it.
    </p>

    <p>
    If you encounter any issues or bugs, we’d love to hear from you. You can report them to
    <a href="mailto:roger@evlinkha.se">roger@evlinkha.se</a> or by visiting
    <a href="https://report.evlinkha.se">https://report.evlinkha.se</a>.
    </p>

    <p>
    Thank you for helping us shape EVLinkHA – and thanks for your patience while we improve!
    </p>

    <p>– Roger @ EVLinkHA</p>

    """

    text = f"""Hi {name},

You’ve been invited to register for EVLinkHA and take part in our public beta.

As this is a beta version, some features may be incomplete, unavailable, or change frequently.
Your feedback is very important to us.

To register, visit the link below:
{registration_url}

Note: This access code can only be used once. Please don’t share it.

Found a bug or issue? Let us know at roger@evlinkha.se or report it at https://report.evlinkha.se

Thanks for joining – and thanks for your patience!

– Roger @ EVLinkHA

"""

    async with httpx.AsyncClient() as client:
        await client.post(
            "https://api.resend.com/emails",
            json={
                "from": f"EVLinkHA <{FROM_EMAIL}>",
                "to": [email],
                "subject": "You're invited to register for EVLinkHA",
                "html": html,
                "text": text,
            },
            headers={"Authorization": f"Bearer {RESEND_API_KEY}"}
        )

async def send_interest_email(email: str, name: str):
    html = f"""
    <p>Hi {name},</p>
    <p>Thanks for signing up to EVLinkHA early access!</p>
    <p>We're happy to let you know that the beta is launching soon. You'll get access to:</p>
    <ul>
      <li>⚡ Live EV integration with Home Assistant</li>
      <li>🔒 Secure open-source backend</li>
      <li>📊 Private data control – no tracking</li>
    </ul>
    <p>You’ll be among the first to try it. Stay tuned for access links!</p>
    <p>– Roger @ EVLinkHA</p>
    """

    async with httpx.AsyncClient() as client:
        await client.post(
            "https://api.resend.com/emails",
            json={
                "from": f"EVLinkHA <{FROM_EMAIL}>",
                "to": [email],
                "subject": "Thanks for joining EVLinkHA!",
                "html": html,
            },
            headers={"Authorization": f"Bearer {RESEND_API_KEY}"}
        )

async def send_newsletter_verification_email(
    email: str,
    name: str | None,
    verification_link: str,
    expires_at: str
):
    """
    Send a newsletter verification email using Resend.

    Parameters:
      - email: recipient's email address
      - name: recipient's name (or None)
      - verification_link: URL that the user must click to verify
      - expires_at: ISO string of when the link expires
    """
    # Compose HTML content
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <h2>Confirm your newsletter subscription</h2>
        <p>Hi {name or 'there'},</p>
        <p>
          Thank you for requesting to subscribe to our EVLinkHA newsletter. Please click the button below to verify your email address:
        </p>
        <p style="text-align: center; margin: 24px 0;">
          <a href="{verification_link}"
             style="background-color: #283593; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Verify Email Address
          </a>
        </p>
        <p>This verification link will expire on <strong>{expires_at}</strong>.</p>
        <p>If the button above does not work, copy and paste this URL into your browser:</p>
        <p><a href="{verification_link}" style="color: #283593; word-break: break-all;">{verification_link}</a></p>
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #ddd;" />
        <p>
          This email was sent by EVLinkHA. If you did not request a newsletter subscription, you can ignore this message.
        </p>
      </body>
    </html>
    """

    # Compose plaintext fallback
    text = f"""Hi {name or 'there'},

Thank you for requesting to subscribe to our EVLinkHA newsletter. Please verify your email by clicking the link below:

{verification_link}

This link will expire on {expires_at}.

If you did not request this, you can ignore this email.

– EVLinkHA
"""

    async with httpx.AsyncClient() as client:
        try:
            await client.post(
                "https://api.resend.com/emails",
                json={
                    "from": f"EVLinkHA <{FROM_EMAIL}>",
                    "to": [email],
                    "subject": "Please confirm your EVLinkHA newsletter subscription",
                    "html": html,
                    "text": text,
                },
                headers={"Authorization": f"Bearer {RESEND_API_KEY}"}
            )
            logger.info("✉️ Verification email sent to %s", email)
        except Exception as e:
            logger.error("❌ Failed to send verification email to %s: %s", email, e, exc_info=True)
            raise
