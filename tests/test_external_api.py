import pytest
from httpx import AsyncClient
from app.main import app
from app.storage import create_api_key_for_user
from unittest.mock import patch

@pytest.mark.asyncio
async def test_get_user_info():
    key = create_api_key_for_user("testuser")
    with patch("app.enode.get_linked_vendor_details", return_value=[{"vendor": "XPENG", "isValid": True}]):
        async with AsyncClient(app=app, base_url="http://test") as client:
            res = await client.get("/api/user/testuser", headers={"X-API-Key": key})
            assert res.status_code == 200
            assert "linked_vendors" in res.json()

@pytest.mark.asyncio
async def test_get_vehicle_status():
    key = create_api_key_for_user("testuser")
    with patch("app.enode.get_vehicle_status", return_value={"status": "mock"}):
        async with AsyncClient(app=app, base_url="http://test") as client:
            res = await client.get("/api/vehicle/demo123/status", headers={"X-API-Key": key})
            assert res.status_code == 200
