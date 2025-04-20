# Frontend Overview

This document describes the structure, technologies, and key patterns used in the frontend of the EvLink project.

---

## 🧰 Technologies Used

| Tool            | Purpose                               |
|-----------------|---------------------------------------|
| **HTMX**        | Declarative interactivity via HTML attributes |
| **Tailwind CSS**| Utility-first CSS framework           |
| **Alpine.js**   | (Optional) Minimal JS reactivity layer |
| **FastAPI Jinja2** | HTML rendering and templating       |

---

## 🧱 Structure

The frontend is rendered server-side using Jinja2 templates with HTMX for partial updates. Tailwind is used to style components in a consistent, responsive way.

```
project-root/
├── templates/
│   ├── base.html         # Global layout
│   ├── dashboard.html    # User dashboard
│   ├── link.html         # Link vendor page
│   ├── partials/         # HTMX-fragments
│   └── ...
├── static/
│   ├── css/
│   │   └── tailwind.css
│   ├── js/
│   │   └── (optional: alpine.js)
│   └── ...
```

---

## 🔄 Flow Patterns

### Linking Vendor (via HTMX)

- User clicks "Link vehicle"
- HTMX triggers `GET /api/user/{user_id}/link?vendor=XPENG`
- Backend returns a link URL
- JS redirects user to Enode link session

### Confirming Link

- Enode redirects to frontend `/callback`
- HTMX `POST /api/confirm-link` with token
- Server confirms and updates state
- HTMX swaps updated dashboard

---

## 💡 HTMX Patterns

Example: Updating vehicle status
```html
<div
  hx-get="/api/vehicle/demo123/status"
  hx-trigger="every 5s"
  hx-target="#vehicle-status"
  hx-swap="outerHTML">
</div>
```

---

## 🎨 Tailwind CSS

Tailwind is used throughout:

```html
<div class="bg-gray-100 p-4 rounded shadow-md">
  <h2 class="text-xl font-bold">Vehicle Info</h2>
</div>
```

Custom configuration is available in `tailwind.config.js`.

---

## 🧪 Testing

- Functional behavior is tested via integration tests (FastAPI + HTMX rendering)
- Optional: Component-level HTML testing via pytest + snapshot testing

---

## 🚀 Future Enhancements

- Add Alpine.js for reactive toggles or modals
- Add real-time websocket updates for status
- Build a reusable dashboard layout
- Add toast notifications

---

_Last updated: 2025-04-20_
