# Architectural Decisions

This document records key technical and architectural decisions made during the development of the `evlink-backend` project.

---

## ✅ Chosen Technologies

| Area                     | Decision               | Notes                                                        |
|--------------------------|------------------------|--------------------------------------------------------------|
| Web framework           | FastAPI                | Async, well-documented, easy testing                         |
| API testing             | httpx + pytest         | Supports async, easy to mock                                 |
| Database                | SQLite                 | Lightweight, file-based, sufficient for small-scale use      |
| Frontend framework      | HTMX                   | Minimal JS, server-rendered HTML                             |
| Styling                 | Tailwind CSS           | Utility-first, easy to integrate with HTMX                   |
| JS helper (optional)    | Alpine.js (optional)   | Can be added later if needed                                 |
| Vendor API              | Enode                  | For EV data (charging, battery, etc.)                        |
| Dev environment         | WSL2 + VS Code         | Supports Python 3.12, Docker DevContainers                   |
| Hosting style           | Self-hosted / Docker   | Open source and portable                                     |

---

## 🧩 Authentication

- ✅ **Current**: API keys stored in database, passed via `X-API-Key` header.
- 🕒 **Planned**: JWT-based authentication with token scopes and expiration.
- ❓ Investigated alternatives: Firebase Auth, Auth0, Clerk — but added complexity.

---

## 📦 Project Structure

- Routes grouped by role (`public`, `external`, `admin`, `devtools`)
- Business logic is kept separate from storage logic
- SQLite is wrapped in helper functions (`storage.py`)
- Enode logic is encapsulated in `enode.py`

---

## 📜 API Conventions

- REST-style endpoints under `/api`
- Always respond with JSON
- Errors use proper HTTP status codes (400, 403, 404, 500)
- Use lowercase snake_case for all endpoint paths

---

## 🔐 Access Control

- All endpoints require authentication except those under `/api/public`
- Access is validated with:
  - API key → user ID lookup
  - Route-level checks for correct ownership
  - Admin routes require API key with user ID `admin`

---

## 🧪 Testing Strategy

- Each route group has a matching test file
- Uses `AsyncClient` with in-memory SQLite
- Mocked Enode responses using `unittest.mock.patch`
- Tests validate both success and forbidden/failure cases

---

## 💡 Decisions Not Taken

| Option                      | Reason Rejected                                          |
|-----------------------------|----------------------------------------------------------|
| Full SPA with React/Vue     | Overkill for dashboard-style frontend                    |
| PostgreSQL from start       | SQLite is sufficient now, easy to migrate later          |
| Authentication provider     | Local auth is easier to control and open-source friendly |
| Enode webhooks only         | Requires polling + caching to handle stale data          |

---

_Last updated: 2025-04-20_
