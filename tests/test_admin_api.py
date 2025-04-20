import pytest
from httpx import AsyncClient
from unittest.mock import patch
from app.main import app
from app.storage import create_api_key_for_user

@pytest.mark.asyncio
async def test_admin_access():
    admin_key = create_api_key_for_user("admin")
    headers = {"X-API-Key": admin_key}

    async with AsyncClient(app=app, base_url="http://test") as client:
        r = await client.get("/api/admin/apikeys", headers=headers)
        assert r.status_code == 200
