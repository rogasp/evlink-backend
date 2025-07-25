"""
SMS Service - Handles SMS verification and notifications using Twilio
"""

import logging
import random
import redis.asyncio as redis
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import os

try:
    from twilio.rest import Client as TwilioClient
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False
    TwilioClient = None


from ..config import (
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_FROM_NUMBER,
    REDIS_URL
)
from ..lib.supabase import get_supabase_admin_client

logger = logging.getLogger(__name__)

class SMSService:
    """Service for handling SMS operations including verification codes"""
    
    def __init__(self):
        self.client = None
        self.enabled = False
        self.redis_client = None
        self._initialize_twilio()
    
    def _initialize_twilio(self):
        """Initialize Twilio client if credentials are available"""
        try:
            if not TWILIO_AVAILABLE:
                logger.warning("📱 Twilio not installed - SMS disabled")
                return
            
            if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER:
                self.client = TwilioClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
                self.enabled = True
                logger.info("📱 SMS service initialized")
            else:
                logger.info("📱 Twilio credentials not configured - SMS disabled")
                
        except Exception as e:
            logger.error(f"📱 Failed to initialize SMS service: {e}")
            self.enabled = False
    
    async def _get_redis_client(self):
        """Get Redis client for storing verification codes"""
        if not self.redis_client:
            self.redis_client = redis.from_url(
                REDIS_URL,
                decode_responses=True
            )
        return self.redis_client
    
    def _generate_verification_code(self) -> str:
        """Generate a 6-digit verification code"""
        return str(random.randint(100000, 999999))
    
    def _get_verification_key(self, user_id: str) -> str:
        """Get Redis key for storing verification codes"""
        return f"sms_verification:{user_id}"
    
    def _get_rate_limit_key(self, phone_number: str) -> str:
        """Get Redis key for rate limiting"""
        return f"sms_rate_limit:{phone_number}"
    
    async def _check_rate_limit(self, phone_number: str, max_attempts: int = 3, window_minutes: int = 5) -> bool:
        """Check if phone number is rate limited"""
        try:
            redis_client = await self._get_redis_client()
            key = self._get_rate_limit_key(phone_number)
            current = await redis_client.get(key)
            
            if current:
                count = int(current)
                if count >= max_attempts:
                    return False
            
            return True
        except Exception as e:
            logger.error(f"Error checking rate limit: {e}")
            return True
    
    async def _increment_rate_limit(self, phone_number: str, window_minutes: int = 5):
        """Increment rate limit counter"""
        try:
            redis_client = await self._get_redis_client()
            key = self._get_rate_limit_key(phone_number)
            pipeline = redis_client.pipeline()
            pipeline.incr(key)
            pipeline.expire(key, window_minutes * 60)
            await pipeline.execute()
        except Exception as e:
            logger.error(f"Error incrementing rate limit: {e}")
    
    async def send_verification_code(self, user_id: str, phone_number: str) -> Dict[str, Any]:
        """Send SMS verification code to user's phone"""
        try:
            if not self.enabled:
                return {
                    "success": False,
                    "message": "SMS service is not configured"
                }
            
            # Validate phone number format
            if not phone_number.startswith('+'):
                return {
                    "success": False,
                    "message": "Invalid phone number format. Please use international format (+1234567890)"
                }
            
            # Validate phone number format and length
            import re
            clean_number = re.sub(r'\D', '', phone_number)
            if len(clean_number) < 8:
                return {
                    "success": False,
                    "message": "Phone number is too short"
                }
            
            # Use Twilio Lookup for validation BEFORE attempting to send SMS
            try:
                # Use Twilio Lookup v2 with basic validation
                lookup = self.client.lookups.v2.phone_numbers(phone_number).fetch()
                
                # DEBUG: Log the full lookup response
                logger.info(f"🔍 Twilio Lookup response for {self._mask_phone_number(phone_number)}:")
                logger.info(f"  valid: {lookup.valid}")
                logger.info(f"  phone_number: {getattr(lookup, 'phone_number', 'N/A')}")
                logger.info(f"  validation_errors: {getattr(lookup, 'validation_errors', [])}")
                logger.info(f"  country_code: {getattr(lookup, 'country_code', 'N/A')}")
                logger.info(f"  national_format: {getattr(lookup, 'national_format', 'N/A')}")
                
                # Check if the number is actually valid using the 'valid' field
                if not lookup.valid:
                    # Get specific validation errors
                    errors = lookup.validation_errors or []
                    logger.info(f"❌ Validation failed with errors: {errors}")
                    
                    if 'TOO_SHORT' in errors:
                        return {
                            "success": False,
                            "message": "Phone number is too short"
                        }
                    elif 'TOO_LONG' in errors:
                        return {
                            "success": False,
                            "message": "Phone number is too long"
                        }
                    elif 'INVALID_COUNTRY_CODE' in errors:
                        return {
                            "success": False,
                            "message": "Invalid country code. Please use international format (+countrycode number)"
                        }
                    elif 'INVALID_LENGTH' in errors:
                        return {
                            "success": False,
                            "message": "Invalid phone number length for this country"
                        }
                    elif 'INVALID_BUT_POSSIBLE' in errors:
                        return {
                            "success": False,
                            "message": "This phone number does not exist. Please check the number and try again."
                        }
                    else:
                        return {
                            "success": False,
                            "message": "Invalid phone number format"
                        }
                
                # Number is valid according to Twilio Lookup
                logger.info(f"✅ Phone number validated: {lookup.phone_number}")
                    
            except Exception as e:
                error_str = str(e)
                logger.warning(f"Twilio Lookup validation failed: {e}")
                
                # Handle Twilio Lookup errors specifically
                if "20404" in error_str or "404" in error_str:
                    return {
                        "success": False,
                        "message": "This phone number does not exist. Please check the number and try again."
                    }
                elif "21211" in error_str or "400" in error_str or "Invalid 'To' Phone Number" in error_str:
                    return {
                        "success": False,
                        "message": "Invalid phone number. Please check the number and try again."
                    }
                else:
                    # For other lookup errors, block SMS to be safe
                    return {
                        "success": False,
                        "message": "Could not validate phone number. Please check the number and try again."
                    }
            
            # Check rate limiting
            if not await self._check_rate_limit(phone_number):
                return {
                    "success": False,
                    "message": "Too many verification attempts. Please try again in 5 minutes."
                }
            
            # Generate verification code
            code = self._generate_verification_code()
            
            # Store code in Redis with 10 minute expiry
            redis_client = await self._get_redis_client()
            key = self._get_verification_key(user_id)
            verification_data = {
                "code": code,
                "phone_number": phone_number,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "attempts": 0
            }
            
            await redis_client.setex(key, 600, str(verification_data))
            
            # Send SMS via Twilio
            message = f"Your EVLink verification code is: {code}. This code expires in 10 minutes."
            
            sms_result = self.client.messages.create(
                body=message,
                from_=TWILIO_FROM_NUMBER,
                to=phone_number
            )
            
            logger.info(f"✅ SMS sent: {sms_result.sid}")
            await self._increment_rate_limit(phone_number)
            
            return {
                "success": True,
                "message": "Verification code sent successfully"
            }
            
        except Exception as e:
            error_str = str(e)
            logger.error(f"❌ Error sending verification SMS: {e}")
            
            # Handle different types of Twilio errors
            if "21211" in error_str or "Invalid 'To' Phone Number" in error_str:
                return {
                    "success": False,
                    "message": "Invalid phone number. Please check the number and try again."
                }
            elif "21212" in error_str:
                return {
                    "success": False,
                    "message": "Phone number format is not supported."
                }
            elif "21612" in error_str:
                return {
                    "success": False,
                    "message": "Cannot send SMS to this phone number."
                }
            elif "20404" in error_str or "404" in error_str:
                return {
                    "success": False,
                    "message": "This phone number does not exist. Please check the number and try again."
                }
            else:
                return {
                    "success": False,
                    "message": "Failed to send verification code. Please try again."
                }
    
    def _mask_phone_number(self, phone_number: str) -> str:
        """Mask all but the last 2 digits of a phone number for logging."""
        if not phone_number or len(phone_number) < 4:
            return "***"
        # Keep plus sign if present, mask all but last 2 digits
        masked = re.sub(r'\d(?=\d{2})', '*', phone_number)
        return masked

    async def verify_code(self, user_id: str, code: str) -> Dict[str, Any]:
        """Verify the SMS verification code"""
        try:
            redis_client = await self._get_redis_client()
            key = self._get_verification_key(user_id)
            stored_data = await redis_client.get(key)
            
            if not stored_data:
                return {
                    "success": False,
                    "message": "Verification code expired or not found"
                }
            
            # Parse stored data
            import ast
            verification_data = ast.literal_eval(stored_data)
            
            # Check attempts
            if verification_data.get('attempts', 0) >= 3:
                await redis_client.delete(key)
                return {
                    "success": False,
                    "message": "Maximum verification attempts exceeded. Please request a new code."
                }
            
            # Verify code
            if verification_data['code'] != code:
                verification_data['attempts'] = verification_data.get('attempts', 0) + 1
                await redis_client.setex(key, 600, str(verification_data))
                
                return {
                    "success": False,
                    "message": "Invalid verification code"
                }
            
            # Code is valid - update user in database
            phone_number = verification_data['phone_number']
            supabase = get_supabase_admin_client()
            
            # Build update payload dynamically to handle missing columns gracefully
            update_payload = {
                "phone_number": phone_number,
                "phone_verified": True,
            }
            
            # Only add phone_verified_at if the column exists
            try:
                # Try to add the timestamp column
                update_payload["phone_verified_at"] = datetime.now(timezone.utc).isoformat()
                result = supabase.table("users").update(update_payload).eq("id", user_id).execute()
            except Exception as db_error:
                # Fallback if phone_verified_at doesn't exist
                logger.warning(f"phone_verified_at column might not exist: {db_error}")
                update_payload.pop("phone_verified_at", None)
                result = supabase.table("users").update(update_payload).eq("id", user_id).execute()
            
            if result.data:
                # Clean up verification data
                await redis_client.delete(key)
                
                logger.info(f"✅ Phone number verified for user {user_id}: {phone_number}")
                return {
                    "success": True,
                    "message": "Phone number verified successfully",
                    "phone_number": phone_number
                }
            else:
                return {
                    "success": False,
                    "message": "Failed to update user record"
                }
                
        except Exception as e:
            logger.error(f"❌ Error verifying code: {e}")
            return {
                "success": False,
                "message": "An error occurred during verification"
            }
    
    async def resend_code(self, user_id: str) -> Dict[str, Any]:
        """Resend verification code to the same phone number"""
        try:
            redis_client = await self._get_redis_client()
            key = self._get_verification_key(user_id)
            stored_data = await redis_client.get(key)
            
            if not stored_data:
                return {
                    "success": False,
                    "message": "No pending verification found"
                }
            
            # Parse stored data
            import ast
            verification_data = ast.literal_eval(stored_data)
            phone_number = verification_data['phone_number']
            
            # Check rate limiting for resend
            if not await self._check_rate_limit(phone_number):
                return {
                    "success": False,
                    "message": "Too many verification attempts. Please try again in 5 minutes."
                }
            
            # Generate new code
            new_code = self._generate_verification_code()
            
            # Update stored data
            verification_data['code'] = new_code
            verification_data['created_at'] = datetime.now(timezone.utc).isoformat()
            verification_data['attempts'] = 0
            
            await redis_client.setex(key, 600, str(verification_data))
            
            # Send new SMS
            message = f"Your new EVLink verification code is: {new_code}. This code expires in 10 minutes."
            
            sms_result = self.client.messages.create(
                body=message,
                from_=TWILIO_FROM_NUMBER,
                to=phone_number
            )
            
            logger.info(f"✅ Resent SMS: {sms_result.sid}")
            await self._increment_rate_limit(phone_number)
            
            return {
                "success": True,
                "message": "Verification code resent successfully"
            }
            
        except Exception as e:
            logger.error(f"❌ Error resending code: {e}")
            return {
                "success": False,
                "message": "An error occurred while resending code"
            }
    
    async def get_verification_status(self, user_id: str) -> Dict[str, Any]:
        """Get verification status for a user"""
        try:
            supabase = get_supabase_admin_client()
            result = supabase.table("users").select(
                "phone_number", "phone_verified", "phone_verified_at"
            ).eq("id", user_id).execute()
            
            if not result.data:
                return {
                    "success": False,
                    "message": "User not found"
                }
            
            user = result.data[0]
            
            # Check for pending verification
            redis_client = await self._get_redis_client()
            key = self._get_verification_key(user_id)
            pending_data = await redis_client.get(key)
            
            return {
                "success": True,
                "phone_number": user.get("phone_number"),
                "phone_verified": user.get("phone_verified", False),
                "phone_verified_at": user.get("phone_verified_at"),
                "has_pending_verification": bool(pending_data)
            }
            
        except Exception as e:
            logger.error(f"Error getting verification status: {e}")
            return {
                "success": False,
                "message": "An error occurred while checking verification status"
            }

# Global instance
_sms_service = None

def get_sms_service() -> SMSService:
    """Get SMS service singleton"""
    global _sms_service
    if _sms_service is None:
        _sms_service = SMSService()
    return _sms_service