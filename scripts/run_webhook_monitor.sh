#!/bin/bash

# === CONFIGURATION ===
LOG_FILE="/var/log/evlink_webhook_monitor.log"
URL="http://localhost:8000/api/admin/webhook/monitor"
TOKEN=$(grep SUPABASE_SERVICE_ROLE_KEY /home/roger/dev/evlink-backend/backend/.env | cut -d '=' -f2 | tr -d '"')

# === RUNTIME ===
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
echo "[$TIMESTAMP] ⏳ Starting webhook monitor check..." | tee -a "$LOG_FILE"
logger "[evlink] ⏳ Webhook monitor check started"

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

BODY=$(echo "$RESPONSE" | sed -e 's/HTTP_STATUS\:.*//g')
STATUS=$(echo "$RESPONSE" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')

if [ "$STATUS" = "200" ]; then
  echo "[$TIMESTAMP] ✅ Monitor check succeeded (HTTP $STATUS)" | tee -a "$LOG_FILE"
  echo "$BODY" | tee -a "$LOG_FILE"
  logger "[evlink] ✅ Webhook monitor succeeded"
else
  echo "[$TIMESTAMP] ❌ Monitor check failed (HTTP $STATUS)" | tee -a "$LOG_FILE"
  echo "$BODY" | tee -a "$LOG_FILE"
  logger "[evlink] ❌ Webhook monitor failed with HTTP $STATUS"
fi
