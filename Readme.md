# EVLink Backend

EVLink is a backend service for integrating electric vehicle data into [Home Assistant](https://www.home-assistant.io/) using the Enode platform. It also provides a minimal frontend dashboard for user management, linking, and diagnostics.

## 🔧 Features

- Secure REST API for Home Assistant integration  
- Vehicle linking using Enode  
- SQLite-based storage with caching  
- API key authentication  
- HTMX-based dashboard (Tailwind CSS planned)  
- Modular codebase with JWT support planned  
- Simple dev/test mode for local development  

## 🚀 Tech Stack

- **Backend:** Python 3.12, FastAPI  
- **Frontend:** HTMX, Tailwind CSS (planned)  
- **Database:** SQLite  
- **Dev Environment:** WSL2 + VS Code + Dev Containers  
- **Testing:** pytest, httpx  

## 📦 Getting Started

### 1. Clone and enter the repo

```bash
git clone https://github.com/<your-org>/evlink-backend.git
cd evlink-backend
```

### 2. Create virtual environment

```bash
python3.12 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment

Copy the example environment file and edit it:

```bash
cp .env.example .env
```

Edit `.env` and provide:

- `ENODE_CLIENT_ID`, `ENODE_CLIENT_SECRET`  
- `ENODE_BASE_URL`, `ENODE_AUTH_URL`  
- `REDIRECT_URI`, `WEBHOOK_URL`  
- `MOCK_LINK_RESULT=true` (for local test mode)  

### 5. Start development server

```bash
uvicorn app.main:app --reload
```

### 6. Optional: Run in devcontainer

If you're using VS Code, open the project in a Dev Container for isolated development.

## 🧪 Testing

We use `pytest` and `httpx.AsyncClient` for async testing. Run all or targeted test suites:

```bash
make test             # Run all tests
make test-access      # Run access control tests
make test-public      # Run public endpoint tests
make test-admin       # Run admin-specific tests
make test-dev         # Run development-only tests
```

## 📁 Project Structure

```
app/
├── api/              # API route definitions
├── enode.py          # Enode API interaction
├── main.py           # FastAPI app
├── storage.py        # SQLite database logic
├── templates/        # HTMX-based frontend templates
├── static/           # Frontend assets (Tailwind later)
docs/
tests/
.env.example
requirements.txt
```

## 📄 Docs

See the `/docs` folder for:

- `architecture.md` – system overview  
- `api-spec.md` – endpoint specs  
- `decisions.md` – architectural decisions  
- `authentication.md` – auth strategy (including JWT plan)  
- `frontend.md` – frontend setup and decisions  
- `frontend-flow.md` – how the frontend operates  
- `link-flow.md` – Enode link process  

## 📌 Roadmap

See `ROADMAP.md` for planned features and progress tracking.

## ✅ License

MIT License. See `LICENSE` for details.
