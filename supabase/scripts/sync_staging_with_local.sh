#!/bin/bash

# --------- CONFIGURATION ---------
DEV_SUPABASE_URL="postgresql://postgres:Avp5PlatOvVQ7goY@db.xipcgzbsznlcqwygwnrg.supabase.co:5432/postgres"
STAGING_SUPABASE_URL="postgresql://postgres:snS3r0kkYENGbUgW@db.xkyvhpurmkylysflbinp.supabase.co:5432/postgres"
SCHEMA="public"
WORKDIR="supabase/local"
MIGRATION_NAME="update_from_dev_$(date +%Y%m%d_%H%M%S)"
MIGRATION_FILE="supabase/migrations/${MIGRATION_NAME}.sql"
LOG_DIR="$(git rev-parse --show-toplevel)/logs"
LOG_FILE="$LOG_DIR/sync_$(date +%Y%m%d_%H%M%S).log"
# ----------------------------------


mkdir -p "$LOG_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "=== EVLINK MIGRATION SYNC ==="
echo "🕒 Start: $(date)"
echo "📄 Log file: $LOG_FILE"
echo

echo "📡 Step 1: Set remote to evlink-dev"
supabase db remote set --db-url "$DEV_SUPABASE_URL" --workdir "$WORKDIR"
if [ $? -ne 0 ]; then
  echo "❌ Failed to set remote to evlink-dev"
  exit 1
fi

echo "📥 Step 2: Pull schema from evlink-dev"
supabase db pull --workdir "$WORKDIR"
if [ $? -ne 0 ]; then
  echo "❌ Failed to pull schema"
  exit 1
fi

echo "🧠 Step 3: Create migration file"
supabase db diff --schema "$SCHEMA" -f "$MIGRATION_FILE" --workdir "$WORKDIR"
if [ $? -ne 0 ]; then
  echo "❌ Failed to generate migration"
  exit 1
fi
echo "📄 Created: $MIGRATION_FILE"

echo "📡 Step 4: Switch remote to evlink-staging"
supabase db remote set --db-url "$STAGING_SUPABASE_URL" --workdir "$WORKDIR"
if [ $? -ne 0 ]; then
  echo "❌ Failed to set remote to evlink-staging"
  exit 1
fi

echo "🚀 Step 5: Push migration to staging"
supabase db push --workdir "$WORKDIR"
if [ $? -ne 0 ]; then
  echo "❌ Failed to push migration"
  exit 1
fi

echo "✅ Migration applied successfully!"
echo "🕒 Done: $(date)"
