# EV Link Backend

**EV Link Backend** is a proxy/microservice between [Home Assistant](https://www.home-assistant.io/) and [Enode](https://enode.com/), allowing users to securely integrate data from their electric vehicles and other energy devices into Home Assistant.

This project enables the connection of Enode-supported vendors (e.g. XPENG, Tesla, SMA) and acts as a backend API to manage:

- OAuth/token handling with Enode
- Webhook reception from Enode (push)
- REST API endpoints for Home Assistant (polling)
- Optional user authentication layer
- Multi-user support and vendor linking

## Key Features
- 🚗 Vehicle and device data from Enode
- 🔐 Secure and token-isolated API
- 🧰 Built with FastAPI for async performance
- 🌍 Deployable as edge or cloud service

---

## Technologies

| Component      | Stack                       |
|----------------|-----------------------------|
| Backend        | Python 3.12 + FastAPI       |
| Database       | SQLite (Turso compatible)   |
| Auth           | Token-based (extensible)    |
| API Comm       | REST + Webhook (Enode push) |
| Deployment     | Docker (optional), WSL2     |

---

## Project Structure

```plaintext
evlink-backend/
├── app/                      # Application source code
│   ├── __init__.py
│   ├── api.py                # FastAPI routes
│   ├── enode.py              # Enode API communication
│   ├── webhook.py            # Webhook receiver (Enode push)
│   ├── storage.py            # DB/cache (Turso/SQLite)
│   └── config.py             # Environment variables and settings
├── tests/                    # Unit/integration tests
├── main.py                   # App entry point
├── .env                      # Local environment variables
├── requirements.txt
├── .gitignore
├── LICENSE                   # MIT License
├── README.md
└── docs/                     # Design and architecture docs
    ├── architecture.md
    ├── api-spec.md
    └── decisions.md
```

---

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/rogasp/evlink-backend.git
   cd evlink-backend
   ```

2. Set up the virtual environment:
   ```bash
   python3.12 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. Add environment variables in `.env`:
   ```env
   ENODE_CLIENT_ID=xxx
   ENODE_CLIENT_SECRET=yyy
   ENODE_BASE_URL=https://enode-api.sandbox.enode.io
   ENODE_AUTH_URL=https://oauth.sandbox.enode.io/oauth2/token
   REDIRECT_URI=http://localhost:8000/callback
   ```

4. Run the app:
   ```bash
   uvicorn main:app --reload
   ```

---

## License

This project is licensed under the MIT License.