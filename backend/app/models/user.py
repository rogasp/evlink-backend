# backend/app/models/user.py

from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    id: str
    email: str
    role: str
    name: Optional[str] = None
    notify_offline: Optional[bool] = False
    stripe_customer_id: Optional[str] = None 
