from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app
from app.storage import get_cached_vehicle
import json

client = TestClient(app)


def test_ping():
    response = client.get("/ping")
    assert response.status_code == 200
    assert response.json() == {"message": "pong"}


@patch("app.api.get_vehicle_data")
def test_get_vehicle(mock_get_vehicle_data):
    mock_get_vehicle_data.return_value = {
        "battery": 80,
        "range": 250,
        "is_charging": True,
        "charge_rate": 14.7,
        "plugged_in": True,
        "updated_at": "2025-04-18T20:00:00Z",
        "display_name": "Mocked Car",
        "vin": "MOCK123",
        "odometer": 12345
    }

    response = client.get("/api/vehicle/mock123")
    assert response.status_code == 200
    data = response.json()
    assert data["battery"] == 80
    assert data["vin"] == "MOCK123"
    assert data["display_name"] == "Mocked Car"


def test_webhook_storage():
    payload = {
        "vehicleId": "test123",
        "chargeState": {"batteryLevel": 77},
        "updated_at": "2025-04-18T20:00:00Z"
    }
    response = client.post(
        "/webhook/enode",
        headers={"Authorization": "Bearer test-token"},
        json=payload
    )
    assert response.status_code == 200

    cached = get_cached_vehicle("test123")
    assert cached is not None
    cached_json = json.loads(cached)
    assert cached_json["chargeState"]["batteryLevel"] == 77
