# app/services/sms.py

import os
from typing import Dict
from twilio.rest import Client

from app.config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
from app.storage.user import get_sms_credits, decrement_sms_credits, log_sms

# Hard-coded test user
TEST_USER_ID = "671043ea-955c-4f57-aba5-4c71a0348412"

class SMSServiceError(Exception):
    pass

class SMSService:
    def __init__(self):
        self.client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        self.from_number = TWILIO_FROM_NUMBER
        if not self.from_number:
            raise SMSServiceError("TWILIO_FROM_NUMBER is not set")

    async def send_sms_for_test(self, to: str, body: str) -> Dict:
        """
        Check SMS credits for TEST_USER_ID, send one SMS if possible,
        decrement by exactly 1 credit and log it.
        """
        # 1) Check remaining credits
        credits = await get_sms_credits(TEST_USER_ID)
        if credits < 1:
            raise SMSServiceError(f"Insufficient SMS credits: {credits} left")

        # 2) Send via Twilio
        try:
            msg = self.client.messages.create(
                from_=self.from_number,
                to=to,
                body=body,
            )
        except Exception as e:
            raise SMSServiceError(f"Twilio send error: {e}")

        # 3) Decrement exactly 1 credit
        new_balance = await decrement_sms_credits(TEST_USER_ID, 1)

        # 4) Log the send
        await log_sms(
            user_id=TEST_USER_ID,
            to_number=to,
            body=body,
            sid=msg.sid,
            segments=1,                # we’re always subtracting one
            status=msg.status,
        )

        return {
            "sid": msg.sid,
            "status": msg.status,
            "remaining_credits": new_balance,
        }
