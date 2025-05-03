import pytest
from httpx import AsyncClient, ASGITransport
from backend.app import app
from starlette.requests import Request
from types import SimpleNamespace
from unittest.mock import patch


@pytest.mark.asyncio
async def test_token_access_from_localhost():
    """Token ska vara tillgängligt från localhost"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.get("/api/token")
        assert r.status_code == 200


@pytest.mark.asyncio
async def test_token_access_from_external():
    """Token ska INTE vara tillgängligt från externa IP:n"""
    class FakeRequest(Request):
        @property
        def client(self):
            return SimpleNamespace(host="8.8.8.8", port=12345)

    # 🧠 Justera detta till din faktiska fil!
    with patch("app.api.devtools.Request", new=FakeRequest):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            r = await client.get("/api/token")
            assert r.status_code in [403, 500], f"Expected 403/500 from external, got {r.status_code}"
