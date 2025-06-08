from pydantic import BaseModel

class User(BaseModel):
    id: str
    email: str | None = None
    role: str | None = None
    name: str | None = None
    notify_offline: bool = False
    stripe_customer_id: str | None = None
    tier: str
    sms_credits: int = 0  
    
    class Config:
        extra = "allow" 
