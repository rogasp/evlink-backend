import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_dev_token_requires_localhost():
    async with AsyncClient(app=app, base_url="http://test") as client:
        r = await client.get("/api/token")
        assert r.status_code in [403, 500]
