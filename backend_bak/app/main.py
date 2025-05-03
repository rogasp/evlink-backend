from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.api import public, private, user_routes, webhook, admin_routes
from app.routes import vehicle
from app.auth.supabase_auth import get_supabase_user  # <-- ev. justera beroende på mappstruktur

app = FastAPI(
    title="EVLink Backend",
    version="0.1.0",
    description="Secure backend for EV integrations via Home Assistant and Enode.",
    root_path="/backend/api"
)

origins = [
    "https://evlink.se",  # Frontend URL i produktion 
    "https://staging.evlink.se",  # Frontend URL i staging
    "http://localhost:3000",  # Frontend URL i utveckling
    "https://4652dfc7a15f.ngrok.app",  # ngrok-url
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🧾 API endpoints
app.include_router(public.router)
app.include_router(private.router, dependencies=[Depends(get_supabase_user)])
app.include_router(user_routes.router)
app.include_router(admin_routes.router)
app.include_router(vehicle.router)

# 🛠️ Admin

# 📬 Webhook
app.include_router(webhook.router)
