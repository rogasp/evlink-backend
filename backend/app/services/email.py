import httpx

from app.config import FROM_EMAIL, RESEND_API_KEY


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