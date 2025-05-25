from pydantic import BaseModel

class User(BaseModel):
    id: str
    email: str | None = None
    role: str | None = None
    name: str | None = None
    notify_offline: bool = False

    class Config:
        extra = "allow" 
