import os
import sqlite3
import json

import httpx
from fastapi import APIRouter, HTTPException, Query, Request, Body, Depends
from app.enode import (
    get_vehicle_data,
    create_link_session,
    get_link_result,
    subscribe_to_webhooks,
    get_access_token,
    get_vehicle_status, ENODE_BASE_URL, get_user_vehicles, get_linked_vendor_details
)
from app.security import require_api_key, require_local_request
from app.storage import (
    get_all_cached_vehicles,
    save_linked_vendor,
    DB_PATH,
    clear_webhook_events,
    create_api_key_for_user,
    list_all_api_keys, get_user, create_user
)

IS_DEV = os.getenv("ENV", "dev") == "dev"

router = APIRouter()

# ========================================
# 🔐 API KEY PROTECTED
# ========================================



# ========================================
# 🛠️ DEV TOOLS (OPTIONAL)
# ========================================

if IS_DEV:






