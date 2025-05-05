#!/bin/bash

# --------- CONFIGURATION ---------
DEV_SUPABASE_URL="postgresql://postgres:Avp5PlatOvVQ7goY@db.xipcgzbsznlcqwygwnrg.supabase.co:5432/postgres"
STAGING_SUPABASE_URL="postgresql://postgres:WK850ewfmjtMqiRr@db.xkyvhpurmkylysflbinp.supabase.co:5432/postgres"
SCHEMA="public"
MIGRATION_NAME="update_from_dev_$(date +%Y%m%d_%H%M%S)"
LOG_DIR="$(git rev-parse --show-toplevel)/logs"
LOG_FILE="$LOG_DIR/sync_$(date +%Y%m%d_%H%M%S).log"
# ----------------------------------


mkdir -p "$LOG_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "=== EVLINK MIGRATION SYNC ==="
echo "🕒 Start: $(date)"
echo "📄 Log file: $LOG_FILE"
echo

echo "📡 Step 1: Pull schema from evlink-dev → local file"
supabase db diff --db-url "$DEV_SUPABASE_URL" --schema "$SCHEMA" -f "$MIGRATION_FILE"

if [ $? -ne 0 ]; then
  echo "❌ Failed to generate migration diff from dev"
  exit 1
fi

echo "📄 Migration file created: $MIGRATION_FILE"

echo "🚀 Step 2: Apply migration file to evlink-staging"
psql "$STAGING_SUPABASE_URL" -f "$MIGRATION_FILE"

if [ $? -ne 0 ]; then
  echo "❌ Failed to apply migration to staging"
  exit 1
fi

echo "✅ Migration applied successfully to staging!"
echo "🕒 Done: $(date)"
