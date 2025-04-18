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
├── Makefile                  # Developer command shortcuts
└── docs/                     # Design and architecture docs
    ├── architecture.md
    ├── api-spec.md
    └── decisions.md
```

---

## Quickstart

```bash
# 1. Clone the repository
$ git clone https://github.com/rogasp/evlink-backend.git
$ cd evlink-backend

# 2. Create your .env file (see .env.example or below)
$ cp .env.example .env

# 3. Initialize the environment (venv + install + DB)
$ make init

# 4. Run the backend locally
$ make run

# 5. Send a test webhook to verify it works
$ make test
```

---

## .env format
```env
ENODE_CLIENT_ID=your_client_id_here
ENODE_CLIENT_SECRET=your_client_secret_here
ENODE_BASE_URL=https://enode-api.sandbox.enode.io
ENODE_AUTH_URL=https://oauth.sandbox.enode.io/oauth2/token
REDIRECT_URI=http://localhost:8000/callback
```

---

## License

This project is licensed under the MIT License.
