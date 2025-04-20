import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch

from app.main import app
from app.storage import create_api_key_for_user

@pytest.mark.asyncio
async def test_admin_access():
    admin_key = create_api_key_for_user("admin")
    user_key = create_api_key_for_user("someuser")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 🧪 Test utan API-nyckel – bör ge 401 Unauthorized
        r = await client.get("/api/admin/apikeys")
        assert r.status_code in [401, 403, 422], "Should reject missing API key"

        # 🧪 Test med vanlig användare – bör ge 403 Forbidden
        r = await client.get("/api/admin/apikeys", headers={"X-API-Key": user_key})
        assert r.status_code == 403, "Non-admin should be forbidden"

        # ✅ Test med admin-nyckel – bör ge 200 OK
        r = await client.get("/api/admin/apikeys", headers={"X-API-Key": admin_key})
        assert r.status_code == 200, "Admin should have access"
        assert isinstance(r.json(), list)  # förutsatt att endpoint returnerar en lista
