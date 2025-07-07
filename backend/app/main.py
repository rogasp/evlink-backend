"""
backend/app/main.py

FastAPI application entrypoint with extensive telemetry middleware for EVLink backend.
"""
import logging
import time
import asyncio
import json
from typing import AsyncIterator
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.security import HTTPAuthorizationCredentials
import sentry_sdk

from app.logger import logger
from app.api import admin, ha, me, private, public, webhook, newsletter, payments
from app.api.admin import routers as admin_routers
from app.storage.telemetry import log_api_telemetry
from app.auth.api_key_auth import get_api_key_user
from app.config import (
    IS_PROD,
    SENTRY_DSN,
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_JWT_SECRET,
    ENDPOINT_COST,  # token costs per endpoint
)
from app.dependencies.auth import get_current_user

# Initialize Sentry
sentry_sdk.init(
    dsn=SENTRY_DSN,
    # Add data like request headers and IP for users,
    # see https://docs.sentry.io/platforms/python/data-management/data-collected/ for more info
    send_default_pii=True,
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
    should_log = path.startswith("/api/") or path.startswith("/webhook")
    start_ts = None
    user_id = None
    raw_body = b""

    if should_log:
        start_ts = time.time()
        raw_body = await request.body()
        # parsar request_payload om möjligt, annars rådata
        try:
            request_payload = json.loads(raw_body)
        except Exception:
            request_payload = raw_body.decode("utf-8", errors="ignore")

        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            try:
                # Vi skickar hela auth_header in i vår dependency
                user = await get_current_user(creds=HTTPAuthorizationCredentials(scheme="Bearer", credentials=auth_header.split(" ",1)[1]))
                user_id = user.id
            except HTTPException:
                # Ogiltig JWT eller API-key
                pass

    # Hämta response
    response = await call_next(request)

    if should_log and start_ts is not None:
        duration_ms = int((time.time() - start_ts) * 1000)
        vehicle_id = request.path_params.get("vehicle_id")
        status = response.status_code

        # Börja med att samla alla delar från response.body_iterator
        body_chunks: list[bytes] = []
        try:
            # OBS: body_iterator kan vara en async iterator
            async for chunk in response.body_iterator:
                body_chunks.append(chunk)
        except Exception:
            # Om det inte går, strunta i response-payload
            body_chunks = []

        # Sätt tillbaka iteratorn som en async generator
        async def _replay_body() -> AsyncIterator[bytes]:
            for chunk in body_chunks:
                yield chunk

        response.body_iterator = _replay_body()

        # Beräkna storlek + payload
        response_payload = None
        response_size = None
        if body_chunks:
            full = b"".join(body_chunks)
            response_size = len(full)
            try:
                response_payload = full.decode("utf-8", errors="ignore")
            except:
                response_payload = None

        # Kostnad
        cost_tokens = 0
        if user_id:
            for prefix, cost in ENDPOINT_COST.items():
                if path.startswith(prefix):
                    cost_tokens = cost
                    break

        # Async log
        asyncio.create_task(
            log_api_telemetry(
                endpoint         = path,
                user_id          = user_id,
                vehicle_id       = vehicle_id,
                status           = status,
                error_message    = None if status < 400 else None,
                duration_ms      = duration_ms,
                timestamp        = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                request_size     = len(raw_body),
                response_size    = response_size,
                request_payload  = request_payload,
                response_payload = response_payload,
                cost_tokens      = cost_tokens,
            )
        )

    return response

# -------------------------
# CORS configuration
# -------------------------
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Routers
# -------------------------
app.include_router(public.router, prefix="/api")
app.include_router(private.router, prefix="/api")
# app.include_router(admin.router, prefix="/api")
app.include_router(webhook.router, prefix="/api")
app.include_router(me.router, prefix="/api")
app.include_router(ha.router, prefix="/api")
app.include_router(newsletter.router, prefix="/api")
app.include_router(payments.router, prefix="/api/payments")
for router in admin_routers:
    app.include_router(router, prefix="/api")

# -------------------------
# Swagger / OpenAPI JWT support
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
