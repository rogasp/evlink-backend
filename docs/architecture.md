# Architecture Overview

## Overview

The EV Link Backend acts as a secure middleware between Home Assistant instances and the Enode API. It facilitates access to vehicle/device data and manages vendor linking, authentication, and real-time updates via webhook or polling.

```
+--------------------+       +---------------------+
|  Home Assistant    | <---> |  EV Link Backend    | <---> Enode API
|  (user instance)   |       |  (FastAPI App)      |      + Webhooks
+--------------------+       +---------------------+
```

## Components

### 1. `main.py`
- Entrypoint for FastAPI application
- Loads routes and app settings

### 2. `app/api.py`
- Public API endpoints consumed by Home Assistant
- Exposes `/vehicle/{id}`, `/user/{id}/link`, etc.

### 3. `app/webhook.py`
- Receives webhook POST requests from Enode
- Persists data for future reads

### 4. `app/enode.py`
- Handles all outbound requests to Enode
- Token management, vendor links, user details

### 5. `app/storage.py`
- Simple persistence layer using SQLite (Turso-compatible)
- Handles inserts, lookups, user/vehicle mappings

### 6. `app/config.py`
- Loads `.env` settings
- Centralizes secrets, URLs, client ID/secret

---

## Data Flow (Polling)

1. Home Assistant queries `/api/vehicle/{id}`
2. Proxy requests data from Enode (with token)
3. Response is returned to HA

## Data Flow (Push)

1. Enode sends webhook to `/webhook/enode`
2. Backend stores incoming data
3. Home Assistant polls backend instead of Enode

---

## Security Considerations
- Each user will be identified via Enode ID
- Long-term token storage should be encrypted or managed in secure store
- Public API endpoints should be rate-limited and protected (future)

---

## Deployment
- Local (WSL2 / Docker)
- Cloud (Render, Fly.io, Railway)
- Edge (Vercel + Turso)

