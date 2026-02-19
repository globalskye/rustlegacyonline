#!/bin/bash
# Reset database: drop, recreate, restart backend (Migrate + Seed)
# Run from project root: ./scripts/reset-db.sh

set -e

echo "Resetting database..."

# Drop and recreate database (FORCE disconnects backend)
docker exec rust-legacy-postgres psql -U rustlegacy -d postgres -c "DROP DATABASE IF EXISTS rustlegacy WITH (FORCE); CREATE DATABASE rustlegacy;"

echo "Database recreated. Restarting backend..."
docker restart rust-legacy-backend

echo "Done. Backend will run Migrate + Seed on startup."
