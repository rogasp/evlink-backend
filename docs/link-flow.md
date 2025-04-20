# Link Flow (Enode Vehicle Integration)

This document outlines the step-by-step process for linking a vehicle through Enode using our backend and frontend.

---

## 🧩 Components Involved

| Component         | Role                                                |
|------------------|-----------------------------------------------------|
| User frontend     | Starts linking flow and receives Enode redirect    |
| Enode             | Provides link URL and OAuth-like flow              |
| Backend (FastAPI) | Generates session, confirms link, saves data       |
| Storage (SQLite)  | Persists user, vendor, vehicle and link info       |

---

## 🔄 Full Flow Diagram

```text
[Frontend] 
    │
    └─ GET /api/user/{user_id}/link?vendor=XPENG
        │
        └─ Backend → Enode: Create link session
                ↓
          Returns link URL
                ↓
[Frontend Redirects to Enode link session]
                ↓
          User completes linking with car vendor
                ↓
          Enode redirects back to our site
                ↓
[Frontend POSTs to /api/confirm-link with link token]
                ↓
→ Backend: Get link result from Enode
→ Backend: Save vendor and vehicle info
→ Backend: Cache vehicle state
                ↓
← Return success response
```

---

## 🚀 Step-by-Step Explanation

### 1. Request a link session

**Frontend**
```http
GET /api/user/testuser/link?vendor=XPENG
```

**Backend**
- Calls `create_link_session()` in `enode.py`
- Returns JSON:
```json
{
  "linkUrl": "https://enode.link/session/abc123",
  "linkToken": "abc123"
}
```

**Frontend**
- Redirects user to `linkUrl`

---

### 2. User completes vendor login

- Enode handles authentication with vendor
- User authorizes access
- Enode redirects to our configured `REDIRECT_URI`

Example:
```http
GET /callback?link_token=abc123
```

---

### 3. Confirm link

**Frontend**
```http
POST /api/confirm-link
Content-Type: application/json
{
  "token": "abc123"
}
```

**Backend**
- Calls `get_link_result(token)` via Enode
- Saves userId and vendor
- Fetches list of linked vehicles
- Saves each vehicle to cache and DB

---

## 🗃 Saved Data

- 🔑 `linked_vendors` in DB
- 🚗 Vehicles (with `userId`, `vehicleId`, `updatedAt`)
- 🔗 Vendor info (e.g., XPENG)

---

## 🔁 Future Enhancements

- Add error handling for expired or invalid links
- Add UI feedback for linking success/failure
- Support re-linking or unlinking vendors
- Handle `user:vehicle:discovered` webhook

---

_Last updated: 2025-04-20_
