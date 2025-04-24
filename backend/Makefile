# Makefile for EVLink backend (FastAPI)
APP=app.main
VENV=.venv
PYTHON=$(VENV)/bin/python
UVICORN=$(VENV)/bin/uvicorn

# Default
run:
	$(UVICORN) $(APP):app --reload

# Run tests
test:
	pytest tests/

test-user-settings:
	pytest tests/test_user_settings.py

# Init database
init-db:
	$(PYTHON) scripts/test_dbinit.py

# Format code
format:
	black app tests

# Lint code
lint:
	ruff check app tests

# Create venv
venv:
	python3 -m venv $(VENV)
	$(VENV)/bin/pip install --upgrade pip

# Install requirements
install:
	$(VENV)/bin/pip install -r requirements.txt
