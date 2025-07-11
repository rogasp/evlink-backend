# backend/app/models/user.py

from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    """Represents a user in the system, including their subscription and notification preferences."""
    id: str
    email: str
    role: str
    name: Optional[str] = None
    notify_offline: Optional[bool] = False
    tier: str
    sms_credits: int = 0
    stripe_customer_id: Optional[str] = None 
    is_on_trial: bool = False
    trial_ends_at: Optional[str] = None # Using str for datetime for now, will convert to datetime object when reading from DB 
