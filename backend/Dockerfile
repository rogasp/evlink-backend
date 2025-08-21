# syntax=docker/dockerfile:1
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Kör som icke-root
RUN useradd --create-home --shell /bin/bash appuser
WORKDIR /app

# Bättre cache: först requirements
COPY backend/requirements.txt ./requirements.txt
RUN pip install -r requirements.txt

# Sedan källkod
COPY backend/ ./
RUN mkdir -p /app/logs && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
# Kör uvicorn (ändra modul om din app heter annat än app.main:app)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
