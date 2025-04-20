# 📡 API Endpoints – EVLink Backend

This document describes the available API endpoints in the EVLink backend, grouped by access level.

---

## 🔓 Public Endpoints

| Method | Endpoint                  | Description                      |
|--------|---------------------------|----------------------------------|
| GET    | `/api/ping`              | Health check endpoint            |
| GET    | `/api/token`             | Development-only token endpoint (localhost only) |
| POST   | `/api/register`         | Create/register a new user      |
| POST   | `/api/confirm-link`     | Accept link token from Enode    |
| GET    | `/api/public/user/{user_id}` | Check if user exists         |
| GET    | `/api/public/user/{user_id}/apikey` | Fetch user’s API key (login flow) |

---

## 🔐 Protected Endpoints (require API key)

### 🔧 User-scoped

| Method | Endpoint                                | Description                            |
|--------|------------------------------------------|----------------------------------------|
| GET    | `/api/user/{user_id}`                   | Get user details                       |
| GET    | `/api/user/{user_id}/link`              | Initiate vehicle linking (Enode)       |
| GET    | `/api/user/{user_id}/vendor`            | Get user's linked vendor details       |

### 🚗 Vehicles

| Method | Endpoint                        | Description                      |
|--------|----------------------------------|----------------------------------|
| GET    | `/api/vehicles`                | List all user vehicles          |
| GET    | `/api/vehicle/{vehicle_id}`    | Get full vehicle data           |
| GET    | `/api/vehicle/{vehicle_id}/status` | Get summary vehicle status   |

---

## 🔒 Admin Endpoints

| Method | Endpoint                | Description                     |
|--------|--------------------------|---------------------------------|
| GET    | `/api/admin/apikeys`   | List all API keys               |
| GET    | `/api/events`          | View webhook events (future)    |

---

## 🧪 Dev Tools (Local only)

| Method | Endpoint      | Description                         |
|--------|----------------|-------------------------------------|
| GET    | `/api/token` | Get mock access token (localhost only) |

> Note: Access control is enforced via API key or IP address depending on the endpoint.

---

## 🔑 Authentication

All protected endpoints require an API key in the request header:

```
X-API-Key: your-user-api-key
```

Future support for JWT will replace or complement API keys.

---

## 🧼 Notes

- All responses are JSON-formatted.
- External Enode calls are mocked in test mode.
- Versioning via `/api/` prefix; no numeric versions used yet.
