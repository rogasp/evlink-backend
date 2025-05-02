from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.api import public, private, user_routes, webhook, admin_routes
from app.security import verify_jwt_token
from app.routes import vehicle  # <-- ev. justera beroende på mappstruktur

app = FastAPI(
    title="EVLink Backend",
    version="0.1.0",
    description="Secure backend for EV integrations via Home Assistant and Enode.",
    root_path="/backend/api"
)

origins = [
    "http://localhost:3000",  # Frontend URL i utveckling
<<<<<<< HEAD
    "https://b044343002fc.ngrok.app",  # ngrok-url
=======
    "https://95bcf61e0e04.ngrok.app",  # ngrok-url
>>>>>>> origin/dev
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
app.include_router(private.router, dependencies=[Depends(verify_jwt_token)])
app.include_router(user_routes.router)
app.include_router(admin_routes.router)
app.include_router(vehicle.router)

# 📬 Webhook
app.include_router(webhook.router)
