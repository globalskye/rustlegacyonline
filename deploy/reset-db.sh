#!/bin/bash
# Reset database (production deploy)
# Run from deploy/: ./reset-db.sh

set -e

echo "Stopping backend (disconnect from DB)..."
docker stop rustlegacy-backend 2>/dev/null || true

echo "Resetting database..."
docker exec rustlegacy-postgres psql -U rustlegacy -d postgres -c "DROP DATABASE IF EXISTS rustlegacy;"
docker exec rustlegacy-postgres psql -U rustlegacy -d postgres -c "CREATE DATABASE rustlegacy;"

echo "Starting backend..."
docker start rustlegacy-backend

echo "Done. Backend will run Migrate + Seed on startup."
