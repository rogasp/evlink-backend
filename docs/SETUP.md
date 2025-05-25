# Setup Guide

This guide explains how to set up EVLinkHA locally for development.

## Prerequisites

* **Git**
* **Node.js** (>=16) & **pnpm**
* **Python 3.12** & **virtualenv**
* **Docker & Docker Compose** (for Supabase local)

## 1. Clone the Repository

```bash
cd ~/dev
git clone https://github.com/rogasp/evlink-backend.git
cd evlink-backend
```

## 2. Setup Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Load environment variables (copy .env.example to .env)
cp .env.example .env
# Update .env with your Supabase URL and keys

# Run FastAPI server
uvicorn app.main:app --reload
```

## 3. Setup Supabase Local

```bash
cd ../supabase/local
supabase start
```

## 4. Setup Frontend

```bash
cd ../../frontend
pnpm install

# Copy env example
cp .env.example .env.local
# Update NEXT_PUBLIC_API_BASE_URL to http://localhost:8000

# Run dev server
pnpm dev
```

## 5. Visit the App

* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

You’re ready to start hacking on EVLinkHA!
