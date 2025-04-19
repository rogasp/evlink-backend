# 🚗 EVLink Backend – Project Roadmap

## 🧭 Vision

EVLink is a backend service designed to provide structured, secure, and scalable access to vehicle data – primarily from EV brands like XPENG – through Enode. The goal is to integrate this data into smart home environments like Home Assistant, while also offering a user-friendly frontend for account management and vendor linking.

---

## 💡 Key Use Case

1. A user downloads the EVLink integration for Home Assistant.
2. They visit the EVLink frontend to create an account.
3. After linking their XPENG vehicle (via Enode), they receive an API key.
4. The API key is configured in Home Assistant.
5. Home Assistant fetches vehicle status (battery, range, etc.) from the EVLink backend using this key.

---

## 🧱 System Components

| Component      | Description                                      |
|----------------|--------------------------------------------------|
| **Frontend**   | Web UI for account creation, linking vendors, managing subscriptions |
| **Backend**    | FastAPI-based service handling API requests and webhooks |
| **Database**   | SQLite (Turso-ready) for storing vehicles, users, tokens, etc. |
| **Webhook**    | Receives and caches real-time updates from Enode |
| **Home Assistant** | Connects via API key to retrieve user-specific vehicle data |

---

## 🔐 Security Architecture

| Area              | Strategy |
|-------------------|----------|
| API access        | API key per user, required in all client requests |
| Webhook auth      | HMAC verification using Enode webhook secret |
| Rate limiting     | Planned for API keys/IPs (via Redis or FastAPI extension) |
| Auth for frontend | Login-based (to be implemented) |
| Data validation   | Strict parsing and filtering of incoming JSON |

---

## 💳 Monetization

The service involves costs (Enode, hosting, etc.), so a billing model is planned:
- Users must create an account
- API key generation requires an active subscription
- Stripe or similar will handle billing
- Plans may vary: 1 vehicle free, multiple vehicles as a paid tier

---

## 📦 Data Model (conceptual)

| Table             | Purpose |
|-------------------|---------|
| `users`           | Registered users |
| `linked_vendors`  | XPENG/Tesla/... connections per user |
| `vehicle_cache`   | Latest state for each vehicle |
| `webhook_events`  | Stored event payloads (for logging/debugging) |
| `api_keys`        | Key used by Home Assistant to authenticate |
| `subscriptions`   | Billing status per user |

---

## ⚙️ Backend Logic Flow

**GET /api/vehicle/:id/status**
1. Check `vehicle_cache` for latest status
2. If data is missing or too old, fetch from Enode
3. Return JSON with battery level, range, etc.

---

## 🛠 Planned Features

- [ ] API key authentication for all endpoints
- [ ] User login + key management via frontend
- [ ] Stripe subscription integration
- [ ] Webhook signature verification (HMAC)
- [ ] Dashboard for user-linked vehicles
- [ ] WebSocket or push capability for future real-time updates

---

## 📌 Priorities

1. ✅ Link Enode vehicle → cache data
2. 🔄 Add secure API key access
3. 🧑‍💻 Add user model and frontend login
4. 💳 Integrate billing flow
5. 📬 Harden webhook security
6. 🌐 Move to hosted DB (Turso) when needed

---

## 🤝 Open Source Goals

This project is designed to be reusable and open for contributions. The architecture supports:

- Adding more vehicle brands via Enode
- Expanding to energy meters, chargers, etc.
- Running your own backend for your smart home setup

---

## 🚀 Want to help?

Issues and PRs are welcome!
