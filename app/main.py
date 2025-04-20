import os
from multiprocessing.managers import public_methods
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse

from app.api import public, external, internal, public_extra, admin, devtools
from app.routes import frontend
from app.webhook import router as webhook_router
from app.storage import init_db

app = FastAPI(
    title="EV Link Backend",
    version="0.1.0",
    description="A secure proxy between Home Assistant and Enode."
)

# 📂 Initierar databasen
init_db()

# ✅ Registrerar API-endpoints
app.include_router(external.router, prefix="/api")   # 🔐 HA (API key)
app.include_router(public.router, prefix="/api")     # 🔓 Public endpoints
app.include_router(public_extra.router, prefix="/api")     # 🔓 Public endpoints
app.include_router(internal.router, prefix="/api")   # 🔐 Frontend (JWT – coming soon)
app.include_router(devtools.router, prefix="/api")   # 🛠️ Local development only
app.include_router(admin.router, prefix="/api")   # 🛠️ Local development only

# 📬 Webhook (ingen prefix – måste vara exakt matchad av Enode)
app.include_router(webhook_router)

app.include_router(frontend.router)

# 🌐 Frontend (statisk mapp)
# app.mount("/static", StaticFiles(directory=os.path.join(os.getcwd(), "static")), name="static")
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# 🔁 Redirect root to frontend
@app.get("/")
async def root():
    return RedirectResponse(url="/static/link.html")
