import pytest
from httpx import AsyncClient, ASGITransport
from backend.app import app

@pytest.mark.asyncio
async def test_public_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 🔁 Test /api/ping
        r = await client.get("/api/ping")
        assert r.status_code == 200
        assert r.json() == {"message": "pong"}

        # 👤 Skapa ny användare via /register
        user_id = "public_testuser"
        r = await client.post("/api/register", json={"user_id": user_id, "email": "public@example.com"})
        assert r.status_code == 200
        assert r.json()["user_id"] == user_id

        # 🔑 Skapa API-nyckel för testet manuellt
        from backend.app import create_api_key_for_user
        create_api_key_for_user(user_id)

        # 🔍 Kolla att användaren finns
        r = await client.get(f"/api/public/user/{user_id}")
        assert r.status_code == 200
        assert r.json()["exists"] is True

        # 🔑 Hämta API-nyckel
        r = await client.get(f"/api/public/user/{user_id}/apikey")
        assert r.status_code == 200
        assert "api_key" in r.json()
