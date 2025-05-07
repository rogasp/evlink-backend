#!/bin/bash

# === CONFIGURATION ===
LOG_FILE="/var/log/evlink_webhook_monitor.log"
URL="http://localhost:8000/api/admin/webhook/monitor"
ENV_FILE="/home/roger/dev/evlink-backend/backend/.env"

# === LOAD TOKEN FROM .env ===
if [ -f "$ENV_FILE" ]; then
  export $(grep -v '^#' "$ENV_FILE" | grep SUPABASE_SERVICE_ROLE_KEY | xargs)
else
  echo "[$(date)] ❌ .env file not found: $ENV_FILE" | tee -a "$LOG_FILE"
  exit 1
fi

TOKEN="$SUPABASE_SERVICE_ROLE_KEY"

# === RUNTIME ===
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
echo "[$TIMESTAMP] ⏳ Starting webhook monitor check..." | tee -a "$LOG_FILE"

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

BODY=$(echo "$RESPONSE" | sed -e 's/HTTP_STATUS\:.*//g')
STATUS=$(echo "$RESPONSE" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')

if [ "$STATUS" = "200" ]; then
  echo "[$TIMESTAMP] ✅ Monitor check succeeded (HTTP $STATUS)" | tee -a "$LOG_FILE"
  echo "$BODY" | tee -a "$LOG_FILE"
else
  echo "[$TIMESTAMP] ❌ Monitor check failed (HTTP $STATUS)" | tee -a "$LOG_FILE"
  echo "$BODY" | tee -a "$LOG_FILE"
fi
