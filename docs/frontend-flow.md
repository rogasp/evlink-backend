# Frontend Flow

This document describes the frontend interaction flow and architecture used in the `evlink-backend` project.

The frontend is intentionally kept lightweight, focusing on dynamic HTML updates using [HTMX](https://htmx.org/) and utility styling via [Tailwind CSS](https://tailwindcss.com/).

---

## 🧩 Frontend Stack

| Component         | Description                                           |
|------------------|-------------------------------------------------------|
| HTMX             | Handles AJAX requests, partial updates, history       |
| Tailwind CSS     | Utility-based styling, responsive layout              |
| Alpine.js (opt)  | May be used for more dynamic components in the future |
| Django-style UX  | Dynamic table input forms, dropdowns, simple buttons  |

---

## 🔁 Page Flow Example (Vehicle Status)

### `/dashboard`

- On page load, sends a GET to `/api/vehicles` (via HTMX trigger or on page load)
- Displays list of linked vehicles
- Each row has a "Details" button:
  - HTMX GET request to `/api/vehicle/{id}` injects content into modal or section
  - Data is live-fetched from cache or Enode via backend logic

---

## 📅 Flow: Link New EV

1. User clicks "Link vehicle"
2. HTMX triggers GET to `/api/user/{user_id}/link?vendor=XPENG`
3. Returns link URL from Enode as a JSON response
4. Page redirects user to Enode flow
5. On Enode callback:
   - `/api/confirm-link` is POSTed via HTMX with link token
   - Link result is saved
   - Vehicles are updated in DB
6. UI is refreshed via HTMX after success

---

## 🔧 Flow: Update Budget (Home dashboard)

1. User chooses year in dropdown
2. HTMX triggers `/api/budget/{year}`
3. Returns dynamic table
4. User types into fields (handled locally or with debounce)
5. On blur or submit:
   - HTMX sends PATCH to `/api/budget/{year}` with updated values
6. Table updates with live total and recalculates as needed

---

## 🔐 Authentication and Frontend

- API keys are passed via `X-API-Key` via JavaScript (future JWT support planned)
- Public routes like `/api/register` are unauthenticated
- Other forms use standard POST with HTMX headers

---

## 🧪 Testing and Debugging

- HTMX requests are testable via FastAPI and httpx
- Frontend is mostly server-driven, simplifying testing
- Frontend dev can use a simple Tailwind watcher + browser reload

---

## 🗂 File Structure (proposed)

```
frontend/
│
├── templates/            # HTML templates (Jinja2 or plain)
│   ├── base.html
│   ├── dashboard.html
│   └── ...
│
├── static/
│   ├── css/
│   │   └── tailwind.css
│   └── js/
│       └── alpine.js (optional)
│
└── ...
```

---

_Last updated: 2025-04-20_
