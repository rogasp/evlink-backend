from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from webhook import router as webhook_router
from api import public

app = FastAPI(
    title="EVLink Backend",
    version="0.1.0",
    description="Secure backend for EV integrations via Home Assistant and Enode."
)

origins = [
    "http://localhost:3000",  # Frontend URL i utveckling
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🛠️ Init database

# 🧾 API endpoints
app.include_router(public.router, prefix="/api")

# 📬 Webhook
app.include_router(webhook_router)

