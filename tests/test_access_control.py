import json
import datetime
import pytest
from unittest.mock import patch
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.storage import create_api_key_for_user


@pytest.mark.asyncio
async def test_access_control():
    user_key = create_api_key_for_user("testuser")
    admin_key = create_api_key_for_user("admin")

    vehicle_mock_data = {
        "id": "demo123",
        "userId": "testuser",
        "updatedAt": datetime.datetime.now(datetime.UTC).isoformat(),
        "information": {"displayName": "Testbil"}
    }

    with patch("app.storage.get_cached_vehicle", return_value=json.dumps(vehicle_mock_data)), \
         patch("app.api.external.get_vehicle_data", return_value=vehicle_mock_data), \
         patch("app.enode.get_vehicle_data", return_value=vehicle_mock_data), \
         patch("app.enode.get_access_token", return_value="mocked-access-token"), \
         patch("app.api.external.create_link_session", return_value={"linkUrl": "https://example.com", "linkToken": "xyz"}), \
         patch("app.enode.get_link_result", return_value={"userId": "testuser", "vendor": "XPENG"}):

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            public_endpoints = [
                ("GET", "/api/ping"),
                ("POST", "/api/confirm-link"),
                ("POST", "/api/register"),
            ]
            protected_endpoints = [
                ("GET", "/api/vehicle/demo123/status"),
                ("GET", "/api/user/testuser/link?vendor=XPENG"),
                ("GET", "/api/vehicles"),
                ("GET", "/api/vehicle/demo123"),
                ("GET", "/api/user/testuser"),
            ]
            admin_endpoints = [
                ("GET", "/api/admin/apikeys"),
                ("GET", "/api/events"),
            ]

            # 🔓 PUBLIC ENDPOINTS
            for method, url in public_endpoints:
                if method == "POST" and "/confirm-link" in url:
                    r = await client.post(url, json={"token": "dummy"})
                elif method == "POST" and "/register" in url:
                    r = await client.post(url, json={"user_id": "testuser"})
                else:
                    r = await getattr(client, method.lower())(url)

                assert r.status_code == 200, f"{url} should be publicly accessible"

            # 🔐 PROTECTED ENDPOINTS
            for method, url in protected_endpoints:
                # Utan nyckel
                r = await getattr(client, method.lower())(url)
                assert r.status_code in [401, 403, 422], f"{url} should be protected"

                # 🧪 Test med fel användare (admin på testusers data)
                r = await getattr(client, method.lower())(url, headers={"X-API-Key": admin_key})
                if "/user/testuser" in url or "/vehicle/demo123" in url:
                    assert r.status_code == 403, f"{url} should be forbidden for wrong user"
                else:
                    assert r.status_code < 500, f"{url} with wrong key should not crash"

                # ✅ Test med rätt användare (testuser på sin egen data)
                r = await getattr(client, method.lower())(url, headers={"X-API-Key": user_key})
                assert r.status_code == 200, f"{url} should be accessible with correct key"

