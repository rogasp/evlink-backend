from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import logging
from twilio.base.exceptions import TwilioRestException

from ..auth.supabase_auth import get_supabase_user
from ..services.sms_service import get_sms_service

router = APIRouter(prefix="/phone", tags=["phone-verification"])

class PhoneNumberRequest(BaseModel):
    phone: str

class VerificationCodeRequest(BaseModel):
    code: str

class PhoneValidationRequest(BaseModel):
    phoneNumber: str

@router.post("/validate")
async def validate_phone_number(request: PhoneValidationRequest):
    """Enhanced phone number validation with Twilio Lookup"""
    try:
        import re
        from ..config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
        from twilio.rest import Client
        
        logger = logging.getLogger(__name__)
        
        # Basic format validation
        phone_regex = r'^\+?[\d\s\-\(\)]+$'
        clean_number = re.sub(r'\D', '', request.phoneNumber)
        
        # Check basic format
        if not bool(re.match(phone_regex, request.phoneNumber)) or len(clean_number) < 8:
            return {
                "valid": False,
                "formatted": request.phoneNumber,
                "message": "Invalid phone number format. Please use international format (+1234567890)",
                "error_code": "INVALID_FORMAT"
            }
        
        # Ensure international format
        formatted_number = request.phoneNumber.strip()
        if not formatted_number.startswith('+'):
            formatted_number = '+' + formatted_number
            
        # Try Twilio Lookup for additional validation
        if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
            try:
                client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
                lookup = client.lookups.v1.phone_numbers(formatted_number).fetch()
                
                return {
                    "valid": True,
                    "formatted": lookup.phone_number,
                    "message": "Phone number is valid",
                    "country_code": lookup.country_code,
                    "national_format": lookup.national_format
                }
                
            except TwilioRestException as e:
                # Handle Twilio-specific errors
                if e.status == 404:
                    return {
                        "valid": False,
                        "formatted": formatted_number,
                        "message": "This phone number does not exist. Please check the number and try again.",
                        "error_code": "NUMBER_NOT_FOUND",
                        "twilio_code": str(e.code)
                    }
                elif e.status == 400:
                    return {
                        "valid": False,
                        "formatted": formatted_number,
                        "message": "Invalid phone number format. Please use international format (+1234567890)",
                        "error_code": "INVALID_FORMAT",
                        "twilio_code": str(e.code)
                    }
                else:
                    # For other Twilio errors, fall back to basic validation
                    logger.warning(f"Twilio Lookup failed: {e}")
                    return {
                        "valid": True,
                        "formatted": formatted_number,
                        "message": "Phone number format appears valid (basic validation)",
                        "warning": "Could not verify with carrier"
                    }
        
        # Fallback to basic validation if Twilio not configured
        return {
            "valid": True,
            "formatted": formatted_number,
            "message": "Phone number format is valid",
            "warning": "Basic validation only"
        }
        
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error validating phone number: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/send-verification-code")
async def send_verification_code(
    request: PhoneNumberRequest,
    current_user: dict = Depends(get_supabase_user)
):
    """Send SMS verification code"""
    try:
        user_id = current_user["id"]
        sms_service = get_sms_service()
        
        result = await sms_service.send_verification_code(user_id, request.phone)
        
        if result["success"]:
            return result
        else:
            # Forward the specific error message from SMS service
            raise HTTPException(status_code=400, detail=result["message"])
            
    except TwilioRestException as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Twilio error sending verification code: {e}")
        
        # Map Twilio error codes to user-friendly messages
        if e.code == 21211:
            raise HTTPException(status_code=400, detail="Invalid phone number. Please check the number and try again.")
        elif e.code == 21212:
            raise HTTPException(status_code=400, detail="Phone number format is not supported.")
        elif e.code == 21612:
            raise HTTPException(status_code=400, detail="Cannot send SMS to this phone number.")
        else:
            raise HTTPException(status_code=400, detail=str(e.msg))
            
    except Exception as e:
        error_str = str(e)
        logger = logging.getLogger(__name__)
        
        # Log validation errors as info (expected user behavior)
        if any(msg in error_str.lower() for msg in ["invalid", "not exist", "too short", "too long", "format"]):
            logger.info(f"Validation failed: {error_str}")
        else:
            # Log actual system errors
            logger.error(f"System error sending verification code: {e}")
        
        # Forward specific error messages from SMS service
        if "This phone number does not exist" in error_str:
            raise HTTPException(status_code=400, detail=error_str)
        elif "Invalid phone number" in error_str:
            raise HTTPException(status_code=400, detail=error_str)
        elif "Phone number is too short" in error_str:
            raise HTTPException(status_code=400, detail=error_str)
        elif "Phone number is too long" in error_str:
            raise HTTPException(status_code=400, detail=error_str)
        elif "rate limit" in error_str.lower():
            raise HTTPException(status_code=429, detail="Too many verification attempts. Please try again in 5 minutes.")
        else:
            raise HTTPException(status_code=400, detail="Failed to send verification code. Please try again.")

@router.post("/verify-phone")
async def verify_phone_code(
    request: VerificationCodeRequest,
    current_user: dict = Depends(get_supabase_user)
):
    """Verify phone code and update user"""
    try:
        user_id = current_user["id"]
        sms_service = get_sms_service()
        
        result = await sms_service.verify_code(user_id, request.code)
        
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result["message"])
            
    except Exception as e:
        error_str = str(e)
        logger = logging.getLogger(__name__)
        
        # Log verification errors as info (expected user behavior)
        if any(msg in error_str.lower() for msg in ["invalid", "expired", "attempts"]):
            logger.info(f"Verification failed: {error_str}")
        else:
            # Log actual system errors
            logger.error(f"System error verifying code: {e}")
        
        # Forward specific error messages from SMS service
        if "Invalid verification code" in error_str:
            raise HTTPException(status_code=400, detail=error_str)
        elif "Verification code expired" in error_str:
            raise HTTPException(status_code=400, detail=error_str)
        elif "Maximum verification attempts" in error_str:
            raise HTTPException(status_code=400, detail=error_str)
        else:
            raise HTTPException(status_code=400, detail="Failed to verify code. Please try again.")

@router.get("/verification-status")
async def get_verification_status(current_user: dict = Depends(get_supabase_user)):
    """Get current phone verification status"""
    try:
        user_id = current_user["id"]
        sms_service = get_sms_service()
        
        result = await sms_service.get_verification_status(user_id)
        return result
        
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error getting verification status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get verification status")

@router.post("/resend-verification-code")
async def resend_verification_code(current_user: dict = Depends(get_supabase_user)):
    """Resend verification code"""
    try:
        user_id = current_user["id"]
        sms_service = get_sms_service()
        
        result = await sms_service.resend_code(user_id)
        
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result["message"])
            
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error resending verification code: {e}")
        raise HTTPException(status_code=500, detail="Failed to resend verification code")