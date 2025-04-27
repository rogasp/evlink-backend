#!/bin/bash

# Gå till projektroten
cd /home/roger/dev/evlink-backend || exit 1

# Aktivera virtual environment
source .venv/bin/activate

# Sätt PYTHONPATH för att hitta app
export PYTHONPATH=./backend

# Starta uvicorn rätt
uvicorn app.main:app --reload --reload-dir backend/app --host 127.0.0.1 --port 8000
