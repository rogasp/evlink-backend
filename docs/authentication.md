# Authentication Strategy

This document outlines the current and planned authentication mechanisms for the EvLink backend.

---

## ✅ Current Status

Authentication is currently handled via **API keys** that are stored in the local SQLite database. These keys are sent in the `X-API-Key` header.

- Each API key is tied to a `user_id`
- Keys are manually fetched or created through public endpoints (for development only)

```http
GET /api/user/{user_id}
Header: X-API-Key: abc123...
```

---

## 🔐 Planned Transition: JWT-based Authentication

We plan to transition from API keys to **JWT tokens** for better security and user session management.

### Why JWT?

- Stateless and secure
- Expiration and refresh support
- Widely compatible with external identity providers (e.g. Google, Auth0)

---

## 🛠️ Implementation Plan

| Phase | Description |
|-------|-------------|
| 1     | Keep API key access for internal/dev routes |
| 2     | Introduce JWT token generation via `/api/token` |
| 3     | Implement JWT-required protected routes |
| 4     | Fully replace API key usage in frontend/backend |

---

## 🧪 Development Token Endpoint

A temporary development endpoint `/api/token` allows local-only access to a static JWT token.

```http
GET /api/token
Header: Host: localhost
```

Access is blocked for all external domains.

---

## 🔗 Optional External Providers

We are considering allowing external authentication via:

- Google OAuth2
- GitHub login
- Auth0 or Supabase

This would reduce the need to manage user credentials manually.

---

## 🔍 Authorization Strategy

Access to resources (e.g. vehicles, vendors) is tied to the `user_id` inside the JWT or API key. The backend enforces:

- **Ownership**: Users may only access their own data
- **Admin role**: Special keys or tokens can be marked as admin for privileged routes

---

## 📁 Token Structure

JWT tokens (when implemented) will include:

```json
{
  "sub": "testuser",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234569999
}
```

---

## ⚠️ Security Considerations

- Tokens should have short expiration and support refresh
- Use HTTPS only in production
- Consider rotating secret keys and revocation strategy

---

_Last updated: 2025-04-20_
