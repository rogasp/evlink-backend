# 📘 API Endpoint Overview

This document lists all current API endpoints, their access level, purpose, and protection status.

---

## 🔐 Access Legend

| Symbol | Access Level       | Description |
|--------|--------------------|-------------|
| 🔓     | Public              | Open to all without authentication |
| 🔐     | API Key Required    | Must include a valid `X-API-Key` header |
| 👮     | Admin Only          | Must include a valid `X-API-Key` for admin user |
| 🛠️     | Dev Only            | Only accessible in development from localhost |

---

## 🔓 Public Endpoints

| Method | Path                   | File        | Description                     |
|--------|------------------------|-------------|---------------------------------|
| GET    | `/api/ping`            | `api.py`    | Basic ping check                |
| POST   | `/api/confirm-link`    | `api.py`    | Confirms vendor link from Enode |

---

## 🔐 API Key Protected Endpoints

| Method | Path                                 | File        | Description                              |
|--------|--------------------------------------|-------------|------------------------------------------|
| GET    | `/api/vehicle/{id}/status`           | `api.py`    | Vehicle status via cache + Enode         |
| GET    | `/api/vehicles`                      | `api.py`    | List cached vehicles                     |
| GET    | `/api/vehicle/{vehicle_id}`          | `api.py`    | Full vehicle info from cache             |
| GET    | `/api/user/{user_id}/link?vendor=X`  | `api.py`    | Start link session for a vendor          |

---

## 👮 Admin-Only Endpoints

| Method | Path                   | File        | Description                      |
|--------|------------------------|-------------|----------------------------------|
| GET    | `/api/admin/apikeys`   | `api.py`    | List all registered API keys     |
| GET    | `/events`              | `api.py`    | List all webhook events          |

---

## 🛠️ Dev/Test Endpoints (Localhost + ENV=dev only)

| Method | Path                         | File            | Description                        |
|--------|------------------------------|------------------|------------------------------------|
| POST   | `/user/{user_id}/apikey`     | `devtools.py`   | Create new API key manually        |
| GET    | `/token`                     | `devtools.py`   | Get raw access token from Enode    |
| POST   | `/webhook/subscribe`         | `devtools.py`   | Subscribe to Enode webhooks        |
| DELETE | `/events`                    | `devtools.py`   | Delete all webhook events          |
