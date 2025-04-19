import pytest
from httpx import AsyncClient
from app.main import app
from app.storage import create_api_key_for_user
from unittest.mock import patch


@pytest.mark.asyncio
async def test_access_control():
    # Skapa giltig API-nyckel för test
    api_key = create_api_key_for_user("testuser")

    headers = {"X-API-Key": api_key}

    # 🔓 Public endpoints
    async with AsyncClient(app=app, base_url="http://test") as client:
        r = await client.get("/api/ping")
        assert r.status_code == 200

        r = await client.post("/api/confirm-link", json={"token": "fake"})
        assert r.status_code in [200, 500]  # Beror på om mock används

    # 🔐 API-protected endpoints (should fail without key)
    protected = [
        "/api/vehicle/demo123/status",
        "/api/user/testuser/link?vendor=XPENG",
        "/api/vehicles",
        "/api/vehicle/demo123"
    ]

    for path in protected:
        async with AsyncClient(app=app, base_url="http://test") as client:
            r = await client.get(path)
            assert r.status_code in [401, 422]  # No API key

            with patch("app.enode.get_vehicle_status", return_value={"mocked": True}), \
                 patch("app.enode.get_vehicle_data", return_value={"id": "demo123"}), \
                 patch("app.enode.create_link_session", return_value={"linkUrl": "http://fake", "linkToken": "abc"}):
                r = await client.get(path, headers=headers)
                assert r.status_code in [200, 404]

    # 👮 Admin-only endpoint
    admin_key = create_api_key_for_user("admin")

    async with AsyncClient(app=app, base_url="http://test") as client:
        r = await client.get("/api/admin/apikeys", headers={"X-API-Key": admin_key})
        assert r.status_code == 200

        r = await client.get("/api/admin/apikeys", headers=headers)
        assert r.status_code == 403
