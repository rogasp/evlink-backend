# =============================
# 📦 EVLink Backend - Makefile
# =============================

run:
	@echo "🚀 Startar API-tjänsten..."
	@python main.py

init-db:
	@echo "📂 Skapar databas och tabeller..."
	@python -c 'from app.storage import init_db; init_db()'

reset-events:
	@echo "🔄 Rensar alla webhook-events..."
	@python -c 'from app.storage import clear_webhook_events; clear_webhook_events()'

list-events:
	@echo "📋 Visar alla webhook-events..."
	@python -c 'import json; from app.storage import sqlite3, DB_PATH; conn = sqlite3.connect(DB_PATH); cursor = conn.execute("SELECT created_at, json FROM webhook_events ORDER BY created_at DESC"); [print(f"{row[0]} →", json.loads(row[1])) for row in cursor.fetchall()]'

token:
	@echo "🔐 Hämtar access token..."
	@curl -s http://localhost:8000/api/token | jq

create-apikey:
	@read -p "Enter user ID: " user_id && \
	python -c "from app.storage import create_api_key_for_user; print('🔑 API key:', create_api_key_for_user('$$user_id'))"

subscribe-webhook:
	@echo "📬 Registrerar webhook hos Enode..."
	@curl -s -X POST http://localhost:8000/api/webhook/subscribe | jq

mock-event:
	@echo "🧪 Skickar mock-event till webhook..."
	@curl -s -X POST http://localhost:8000/webhook \
		-H "Content-Type: application/json" \
		-d '[{
			"eventType": "user:vehicle:updated",
			"data": {
				"id": "demo-123",
				"userId": "rogasp",
				"chargeState": {
					"batteryLevel": 85
				},
				"information": {
					"displayName": "Testbil",
					"brand": "XPENG",
					"model": "G6",
					"year": 2024
				}
			}
		}]' | jq

list-endpoints:
	PYTHONPATH=. python3 scripts/list_endpoints.py

export-endpoints:
	PYTHONPATH=. python3 scripts/export_endpoints.py
