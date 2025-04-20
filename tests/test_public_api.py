import pytest
from httpx import AsyncClient
from app.main import app
from unittest.mock import patch

@pytest.mark.asyncio
async def test_ping():
    async with AsyncClient(app=app, base_url="http://test") as client:
        res = await client.get("/api/ping")
        assert res.status_code == 200
        assert res.json() == {"message": "pong"}

@pytest.mark.asyncio
async def test_confirm_link():
    with patch("app.enode.get_link_result", return_value={"userId": "demo", "vendor": "XPENG"}):
        async with AsyncClient(app=app, base_url="http://test") as client:
            res = await client.post("/api/confirm-link", json={"token": "mocktoken"})
            assert res.status_code == 200

@pytest.mark.asyncio
async def test_register_and_check_user():
    async with AsyncClient(app=app, base_url="http://test") as client:
        await client.post("/api/register", json={"user_id": "newuser"})
        r = await client.get("/api/public/user/newuser")
        assert r.status_code == 200
        assert r.json()["exists"] is True