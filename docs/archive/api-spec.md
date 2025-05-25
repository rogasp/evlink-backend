# API Specification

This document defines the available endpoints in the `evlink-backend` API, including public, protected, and admin routes. Authentication is based on API keys for now, with plans to migrate to JWT in the future.

---

## 🔓 Public Endpoints

Accessible without authentication.

### `GET /api/ping`

Health check endpoint.

```json
Response: { "message": "pong" }
```

---

### `POST /api/register`

Registers a new user.

**Body:**
```json
{
  "user_id": "your_id",
  "email": "optional@example.com"
}
```

**Response:**
```json
{ "status": "created", "user_id": "your_id" }
```

---

### `POST /api/confirm-link`

Used after Enode linking flow.

**Body:**
```json
{ "token": "linkToken" }
```

**Response:**
```json
{ "status": "linked", "vendor": "XPENG" }
```

---

## 🔐 Protected Endpoints

Require valid API key via `X-API-Key` header. Can only access resources owned by the authenticated user.

### `GET /api/user/{user_id}`

Returns user metadata.

### `GET /api/user/{user_id}/link?vendor=XPENG`

Triggers Enode link session. Only accessible by the user.

**Response:**
```json
{ "linkUrl": "https://link.example.com", "linkToken": "abc123" }
```

---

### `GET /api/user/{user_id}/vehicles`

List all vehicles linked to the user.

---

### `GET /api/vehicle/{vehicle_id}`

Returns vehicle data (metadata, battery, etc.)

---

### `GET /api/vehicle/{vehicle_id}/status`

Returns cached or fresh vehicle status from Enode. Ownership is enforced.

---

## 🔧 Development Endpoint

### `GET /api/token`

Returns a temporary dev token for testing. Only accessible from `localhost`.

**Response:**
```json
{ "token": "devtoken" }
```

---

## 🔑 Public Login Support (Temporary)

For non-JWT environments only.

### `GET /api/public/user/{user_id}`

Check if user exists.

**Response:**
```json
{ "exists": true }
```

---

### `GET /api/public/user/{user_id}/apikey`

Fetch API key for login (used in dev environments only).

---

## 🛠 Admin Endpoints

Require API key for a user with ID `admin`.

### `GET /api/admin/apikeys`

Returns a list of all API keys.

---

### `GET /api/events`

Placeholder for future event log (e.g., webhook logs, link attempts).

---

## 🧪 Notes

- All routes under `/api/user/{user_id}` or `/api/vehicle/{vehicle_id}` enforce ownership.
- Data from Enode is cached in SQLite.
- Enode integration requires ENV variables to be correctly configured.
