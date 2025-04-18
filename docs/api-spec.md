# API Specification – EV Link Backend

## Base URL
```
http://localhost:8000/api
```

---

## Endpoints

### `GET /vehicle/{vehicle_id}`
Fetches the latest known vehicle data from Enode or internal cache.

#### Request
```http
GET /api/vehicle/7c62b387-9c5c-4dc9-94d9-edab9b72812e
```

#### Response
```json
{
  "battery": 78,
  "range": 180,
  "is_charging": true,
  "charge_rate": 14.7,
  "plugged_in": true,
  "updated_at": "2025-04-14T18:25:43Z",
  "display_name": "Roger's G6",
  "vin": "0G702NSSRCF849730",
  "odometer": 9820
}
```

---

### `POST /webhook/enode`
Receives push data from Enode and stores it.

#### Request (from Enode)
```http
POST /webhook/enode
Content-Type: application/json
Authorization: Bearer <secure-token>
```

#### Payload (example)
```json
{
  "vehicleId": "7c62b387-9c5c-4dc9-94d9-edab9b72812e",
  "chargeState": {
    "batteryLevel": 78,
    "range": 180,
    "isCharging": true
  },
  "odometer": {
    "distance": 9820
  }
}
```

#### Response
```json
{ "status": "ok" }
```

---

### `POST /user/{user_id}/link`
Creates a link session URL to redirect user to Enode linking flow.

#### Response
```json
{
  "linkUrl": "https://sandbox.link.enode.com/abc123"
}
```

---

## Authentication
- Currently no auth, but tokens per HA instance or vendor key are planned.

---

## Webhooks
- Must be secured via secret token or signature header (to be implemented)

---

## Future Endpoints (planned)
- `GET /user/{user_id}` – Get linked vendors
- `DELETE /user/{user_id}/vendor/{vendor}` – Unlink vendor
- `GET /vehicle/{id}/status` – Separate data types

---

## Notes
- Responses will be cacheable for polling
- Webhook data takes precedence over live fetch
- All endpoints return JSON

