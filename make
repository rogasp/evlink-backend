# Makefile

.PHONY: init test run

init:
	python3.12 -m venv .venv
	source .venv/bin/activate && pip install -r requirements.txt
	python -c "from app.storage import init_db; init_db()"

run:
	source .venv/bin/activate && uvicorn main:app --reload

test:
	curl -X POST http://localhost:8000/webhook/enode \
	  -H "Content-Type: application/json" \
	  -H "Authorization: Bearer test-token" \
	  -d '{"vehicleId": "test123", "chargeState": {"batteryLevel": 88}, "updated_at": "2025-04-18T20:00:00Z"}'
