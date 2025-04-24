from fastapi import FastAPI

from app.webhook import router as webhook_router
from app.api import devtools, public, public_extra, external, internal, admin

app = FastAPI(
    title="EVLink Backend",
    version="0.1.0",
    description="Secure backend for EV integrations via Home Assistant and Enode."
)

# 🛠️ Init database

# 🧾 API endpoints
app.include_router(public.router, prefix="/api")
app.include_router(public_extra.router, prefix="/api")
app.include_router(external.router, prefix="/api")
app.include_router(internal.router, prefix="/api")
app.include_router(devtools.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

# 📬 Webhook
app.include_router(webhook_router)

