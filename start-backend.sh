#!/bin/bash
cd /home/roger/dev/evlink-backend || exit 1
source .venv/bin/activate
export PYTHONPATH=./backend

# ✅ Läs in alla miljövariabler från .env
export $(grep -v '^#' .env | xargs)

# ✅ Starta FastAPI
uvicorn app.main:app --reload --reload-dir backend/app --host 127.0.0.1 --port 8000
