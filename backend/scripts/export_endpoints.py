# scripts/export_endpoints.py

from fastapi.routing import APIRoute
from backend.app import app

# Manuell access-nivåtaggning
ACCESS_MAP = {
    "/api/ping": "🔓 Public",
    "/api/confirm-link": "🔓 Public",
    "/api/vehicle/{vehicle_id}/status": "🔐 API Key Required",
    "/api/user/{user_id}/link": "🔐 API Key Required",
    "/api/vehicles": "🔐 API Key Required",
    "/api/vehicle/{vehicle_id}": "🔐 API Key Required",
    "/api/admin/apikeys": "👮 Admin Only",
    "/api/events": "👮 Admin Only",
    "/api/user/{user_id}/apikey": "🛠️ Dev Only",
    "/api/token": "🛠️ Dev Only",
    "/api/webhook/subscribe": "🛠️ Dev Only",
    "/webhook": "🔓 Public",
    "/api/user/{user_id}": "🔐 API Key Required",
}

# Skriv till fil
with open("docs/ENDPOINTS.md", "w") as f:
    f.write("# 📘 API Endpoint Overview\n\n")
    f.write("Generated from live routes in the application.\n\n")
    f.write("| Method | Path | Access |\n")
    f.write("|--------|------|--------|\n")

    for route in app.routes:
        if isinstance(route, APIRoute):
            methods = ",".join(sorted(route.methods - {"HEAD", "OPTIONS"}))
            access = ACCESS_MAP.get(route.path, "❓ Unknown")
            f.write(f"| {methods} | `{route.path}` | {access} |\n")

print("✅ Exported to docs/ENDPOINTS.md")
