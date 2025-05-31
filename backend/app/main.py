"""
backend/app/main.py

FastAPI application entrypoint with telemetry middleware for EVLink backend.
"""
import logging
import time
import asyncio
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.logger import logger
from app.api import admin, ha, me, private, public, webhook
from app.storage.telemetry import log_api_telemetry
from app.auth.api_key_auth import get_api_key_user
from app.config import (
    IS_PROD,
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_JWT_SECRET,
)

logger.info("🚀 Starting EVLink Backend...")

app = FastAPI(
    title="EVLink Backend",
    version="0.2.0",
    description="Minimal FastAPI backend for secured API access.",
    docs_url=None if IS_PROD else "/docs",
    redoc_url=None if IS_PROD else "/redoc",
    openapi_url=None if IS_PROD else "/openapi.json",
)

# -------------------------
# Telemetry middleware
# -------------------------
@app.middleware("http")
async def telemetry_middleware(request: Request, call_next):
    path = request.url.path
    # Endast logga om sökvägen börjar med "/api/status/"
    is_ha_endpoint = path.startswith("/api/status/")
    start_time = time.time() if is_ha_endpoint else None
    user_id = None
    vehicle_id = None

    if is_ha_endpoint:
        # Försök hämta autentiserad användare (för user_id)
        try:
            user = await get_api_key_user(
                authorization=request.headers.get("Authorization", "")
            )
            user_id = user.id
        except Exception:
            pass

        # Extrahera vehicle_id från path_params om det finns
        vehicle_id = request.path_params.get("vehicle_id")

    # Skicka vidare request till övrig routing
    response = await call_next(request)

    if is_ha_endpoint and start_time is not None:
        duration_ms = int((time.time() - start_time) * 1000)
        # Asynkront logga telemetridata utan att blockera svaret
        asyncio.create_task(
            log_api_telemetry(
                endpoint=path,
                user_id=user_id,
                vehicle_id=vehicle_id,
                status=response.status_code,
                error_message=None if response.status_code < 400 else None,
                duration_ms=duration_ms,
                timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            )
        )

    return response

# -------------------------
# CORS-konfiguration
# -------------------------
origins = ["http://localhost:3100"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Routrar
# -------------------------
app.include_router(public.router, prefix="/api")
app.include_router(private.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(webhook.router, prefix="/api")
app.include_router(me.router, prefix="/api")
app.include_router(ha.router, prefix="/api")

# -------------------------
# Swagger / OpenAPI JWT-support
# -------------------------
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    components = openapi_schema.setdefault("components", {})
    security_schemes = components.setdefault("securitySchemes", {})
    security_schemes["bearerAuth"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
    }

    for path_item in openapi_schema.get("paths", {}).values():
        for operation in path_item.values():
            operation.setdefault("security", [{"bearerAuth": []}])

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
