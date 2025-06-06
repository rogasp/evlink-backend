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
| POST   | `/api/newsletter/subscribe` | Request to join the newsletter |
| POST   | `/api/newsletter/unsubscribe` | Remove address from newsletter |
| POST   | `/api/newsletter/manage/subscribe` | Subscribe an existing user |
| POST   | `/api/newsletter/manage/unsubscribe` | Unsubscribe an existing user |
| GET    | `/api/newsletter/verify` | Confirm newsletter subscription |

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