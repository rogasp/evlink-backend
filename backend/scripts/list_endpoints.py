# scripts/list_endpoints.py

import sys
from pathlib import Path
from fastapi.routing import APIRoute
from backend.app import app

# Lägg till projektroten i sys.path
sys.path.append(str(Path(__file__).resolve().parents[1]))

# ⛳ Manuell mapping av accessnivåer
ACCESS_MAP = {
    "/api/ping": "🔓",
    "/api/confirm-link": "🔓",
    "/api/vehicle/{vehicle_id}/status": "🔐",
    "/api/user/{user_id}/link": "🔐",
    "/api/vehicles": "🔐",
    "/api/vehicle/{vehicle_id}": "🔐",
    "/api/admin/apikeys": "👮",
    "/api/events": "👮",
    "/webhook": "🔓",  # skyddad via HMAC senare
    "/api/user/{user_id}/apikey": "🛠️",
    "/api/token": "🛠️",
    "/api/webhook/subscribe": "🛠️",
    "/api/link/callback": "🔓",
}

print("\n📋 Listing all registered API endpoints:\n")
print(f"{'METHODS':8}  {'PATH':35}  ACCESS")
print("-" * 60)

for route in app.routes:
    if isinstance(route, APIRoute):
        methods = ",".join(sorted(route.methods - {"HEAD", "OPTIONS"}))
        access = ACCESS_MAP.get(route.path, "❓")
        print(f"{methods:8}  {route.path:35}  {access}")
