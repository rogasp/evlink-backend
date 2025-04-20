# System Architecture

This document describes the overall architecture of the `evlink-backend` project.

---

## 🧱 Overview

The project is a modular backend API designed to:

- Integrate with [Enode](https://www.enode.com/) for EV vehicle data
- Provide a REST API for a frontend dashboard (HTMX-based)
- Optionally connect with Home Assistant
- Be open source and self-hostable
- Be secure and scalable

---

## 🔁 Components

### 1. **API Server (`FastAPI`)**

Handles all API requests. Structured into logical route groups:
- `public.py`: public unauthenticated routes
- `external.py`: protected user-level routes
- `admin.py`: admin-only routes
- `devtools.py`: local/dev-only tools
- `public_extra.py`: temporary support for login during development

---

### 2. **Storage Layer (`storage.py`)**

SQLite-based local database used to store:
- Users
- API keys
- Cached vehicle data
- Linked vendors

Simple CRUD functions abstract direct SQL usage.

---

### 3. **Enode Integration (`enode.py`)**

Handles:
- OAuth token retrieval
- Linking sessions
- Fetching vehicle metadata
- Receiving webhook events

---

### 4. **Home Assistant Proxy (planned)**

A microservice that communicates between `evlink-backend` and Home Assistant.

Planned features:
- Push sensor states (e.g., battery, charging, range)
- Trigger actions (e.g., start charging)

---

### 5. **Frontend (HTMX + TailwindCSS)**

Minimal JavaScript. Client renders dynamic dashboards using HTMX and HTML fragments.

Alpine.js may be used later for interactivity.

---

### 6. **Authentication**

Currently based on API keys. Stored in the database and attached via `X-API-Key` header.

Future upgrade to JWT is planned.

---

## 🌐 Request Flow

```plaintext
[Browser] → [FastAPI Routes] → [Storage / Enode] → [Cache / Response]
```

### Example:
```plaintext
GET /api/vehicle/demo123/status
 → checks cache
 → if stale, queries Enode
 → returns JSON
```

---

## 🧪 Testing

All tests are located in `tests/` and separated by:

- `test_access_control.py`: ownership checks
- `test_public_api.py`: public functionality
- `test_admin_api.py`: admin endpoint checks
- `test_dev_api.py`: dev-only behaviors

Test coverage includes permission logic, data validation, and caching.

---

## 🧩 Deployment

Works with:
- Docker
- VSCode DevContainers
- WSL2 on Windows

Environments managed via `.env` file.

---

## 📈 Future Extensions

- JWT authentication
- OAuth support (Google login)
- PostgreSQL migration
- Integration with more vendors via Enode
- Web UI admin dashboard

---

_Last updated: 2025-04-20_
