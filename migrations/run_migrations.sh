#!/bin/bash
# ============================================================
# run_migrations.sh
# Executes all OneBlood migrations in order
# Usage: ./run_migrations.sh
# Requires: DATABASE_URL env var set
# ============================================================

set -euo pipefail

MIGRATIONS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATION_FILES=(
  "001_extensions.sql"
  "002_enums.sql"
  "003_users.sql"
  "004_donor_profiles.sql"
  "005_admin_profiles.sql"
  "006_hospitals.sql"
  "007_blood_requests.sql"
  "008_donor_responses.sql"
  "009_donations.sql"
  "010_notifications.sql"
  "011_audit_logs.sql"
  "012_functions.sql"
  "013_rls.sql"
  "014_performance.sql"
)

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL environment variable is not set."
  exit 1
fi

echo "=============================="
echo " OneBlood Database Migrations "
echo "=============================="
echo "Target: $DATABASE_URL"
echo ""

for file in "${MIGRATION_FILES[@]}"; do
  filepath="$MIGRATIONS_DIR/$file"

  if [[ ! -f "$filepath" ]]; then
    echo "ERROR: Migration file not found: $filepath"
    exit 1
  fi

  echo "Running: $file ..."
  psql "$DATABASE_URL" \
    --single-transaction \
    --set ON_ERROR_STOP=1 \
    --file "$filepath"

  echo "  ✓ $file applied"
done

echo ""
echo "All migrations applied successfully."
