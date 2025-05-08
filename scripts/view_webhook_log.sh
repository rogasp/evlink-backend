#!/bin/bash

# Logfile path
LOG_FILE="/var/log/evlink_webhook_monitor.log"

# Default lines to show
LINES=50
FOLLOW=0

# Parse arguments
while [[ "$#" -gt 0 ]]; do
  case $1 in
    -f|--follow) FOLLOW=1 ;;
    -n|--lines) LINES="$2"; shift ;;
    *) echo "⚠️ Unknown parameter passed: $1"; exit 1 ;;
  esac
  shift
done

if [ ! -f "$LOG_FILE" ]; then
  echo "❌ Log file not found at $LOG_FILE"
  exit 1
fi

echo "📄 Showing last $LINES lines from $LOG_FILE"
echo "------------------------------------------------------------"

if [ "$FOLLOW" -eq 1 ]; then
  tail -n "$LINES" -f "$LOG_FILE"
else
  tail -n "$LINES" "$LOG_FILE"
fi
