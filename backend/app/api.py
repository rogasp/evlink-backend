import os

from fastapi import APIRouter

IS_DEV = os.getenv("ENV", "dev") == "dev"

router = APIRouter()

# ========================================
# 🔐 API KEY PROTECTED
# ========================================



# ========================================
# 🛠️ DEV TOOLS (OPTIONAL)
# ========================================

if IS_DEV:






