# 🛣️ Roadmap – EVLink Backend

This document outlines the planned features and development milestones for the EVLink backend project.

---

## ✅ Completed

- [x] FastAPI project scaffold
- [x] SQLite storage with migrations
- [x] User registration + API key auth
- [x] Basic `/ping` and `/token` endpoints
- [x] Vehicle data caching logic
- [x] Integration with Enode (mocked and real)
- [x] Admin-only API key listing
- [x] HTMX selected for frontend
- [x] Tailwind CSS selected for styling
- [x] Test suite setup: access, public, admin, dev
- [x] All tests passing ✅
- [x] GitHub Issues + Project board initialized

---

## 🏗️ In Progress

- [ ] JWT authentication system
- [ ] External authentication provider evaluation (e.g. Auth0, Firebase)
- [ ] Frontend styling with Tailwind
- [ ] Environment-based config cleanup
- [ ] Documentation update across all docs

---

## 🧠 Planned (Backlog)

- [ ] Frontend dashboard: vehicle overview
- [ ] Link new vehicle via Enode (HTMX flow)
- [ ] Event log viewer for Enode webhooks
- [ ] Multi-user support improvements
- [ ] Unit/system tests for failure scenarios
- [ ] Real-time update handling via webhooks

---

## 🚨 Stretch Goals

- [ ] Alpine.js for frontend interactivity (if needed)
- [ ] Export vehicle data to CSV/JSON
- [ ] HA integration via webhook or MQTT
- [ ] Docker Compose for local dev + testing
- [ ] Postgres support (optional for production)
- [ ] Hosted version with user login

---

## 🧪 Test Coverage Goals

- [ ] Full coverage of API key access rules
- [ ] Auth token validation across endpoints
- [ ] Mocking of all external Enode dependencies
- [ ] Failover behavior on Enode API downtime

---

## 📦 Release Plan

- `v0.1.0` – Internal MVP (Local usage only)
- `v0.2.0` – Link session + dashboard
- `v1.0.0` – Public release with full docs and deploy guide
