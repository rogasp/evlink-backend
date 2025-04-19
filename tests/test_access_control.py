import pytest
import httpx
from unittest.mock import patch
from app.main import app
from app.storage import create_api_key_for_user

@pytest.mark.asyncio
async def test_access_control():
    user_key = create_api_key_for_user("testuser")
    admin_key = create_api_key_for_user("admin")

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

    with patch("app.enode.get_vehicle_status", return_value={"status": "ok"}), \
            patch("app.enode.get_vehicle_data",
                  return_value={"id": "demo123", "information": {"displayName": "Testbil"}}), \
            patch("app.api.get_vehicle_data",
                  return_value={"id": "demo123", "information": {"displayName": "Testbil"}}), \
            patch("app.enode.create_link_session", return_value={"linkUrl": "https://example.com", "linkToken": "xyz"}), \
            patch("app.enode.get_link_result", return_value={"userId": "testuser", "vendor": "XPENG"}):

        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:

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
                r = await getattr(client, method.lower())(url)
                assert r.status_code in [401, 403, 422], f"{url} should be protected"

                r = await getattr(client, method.lower())(url, headers={"X-API-Key": admin_key})
                if "/user/testuser" in url:
                    assert r.status_code == 403, f"{url} should be forbidden for wrong user"
                else:
                    assert r.status_code < 500, f"{url} with wrong key should not crash"

                r = await getattr(client, method.lower())(url, headers={"X-API-Key": user_key})
                assert r.status_code == 200, f"{url} should be accessible with correct key"

            # 👮 ADMIN ENDPOINTS
            for method, url in admin_endpoints:
                r = await getattr(client, method.lower())(url)
                assert r.status_code in [401, 403, 422], f"{url} should be admin-only"

                r = await getattr(client, method.lower())(url, headers={"X-API-Key": user_key})
                assert r.status_code == 403, f"{url} should be forbidden for non-admin"

                r = await getattr(client, method.lower())(url, headers={"X-API-Key": admin_key})
                assert r.status_code == 200, f"{url} should be accessible by admin"
