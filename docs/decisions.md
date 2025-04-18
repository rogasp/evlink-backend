# Architectural Decisions – EV Link Backend

## 1. Chose FastAPI over Flask
- ✅ Async I/O support out of the box
- ✅ Better performance for concurrent requests
- ✅ Built-in OpenAPI and ReDoc documentation
- ✅ Easier to scale horizontally or edge-deploy
- ❌ Slightly higher learning curve (acceptable)

## 2. Proxy model instead of direct Enode usage in HA
- ✅ Centralizes and protects Enode credentials
- ✅ Enables webhook reception (HA cannot receive public webhooks)
- ✅ Allows multi-user support
- ✅ Opens possibility for data enrichment, caching, rate-limiting

## 3. SQLite (Turso) as database
- ✅ Edge-hosted, low-latency read performance
- ✅ No need to manage servers
- ✅ Simple local dev via SQLite compatibility
- ❌ Write-intensive loads may need redesign later

## 4. REST API over push
- ✅ Simpler to integrate in HA using polling sensors
- ✅ Webhook stores data, which sensors read
- ❌ Real-time updates via WebSocket would require reverse-connection architecture

## 5. English for all code, comments, and docs
- ✅ Open source friendliness
- ✅ Consistent style
- ✅ Easier collaboration globally

## 6. Separation of code and documentation
- ✅ `docs/` folder holds all architecture/API/decision files
- ✅ Codebase stays clean and scalable

## 7. Local-first development in WSL2 + GitHub sync
- ✅ Quick test cycles
- ✅ Easy to version control
- ✅ Production deploy targets to be chosen later

## Next Decisions
- [ ] How to authenticate requests from HA
- [ ] How to support multiple vendors in one HA instance
- [ ] How to configure long-term secure token storage

