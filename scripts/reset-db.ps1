# Reset database: drop, recreate, restart backend (Migrate + Seed)
# Run from project root: .\scripts\reset-db.ps1

$ErrorActionPreference = "Stop"

Write-Host "Resetting database..." -ForegroundColor Yellow

# Drop and recreate database (FORCE disconnects backend)
docker exec rust-legacy-postgres psql -U rustlegacy -d postgres -c "DROP DATABASE IF EXISTS rustlegacy WITH (FORCE); CREATE DATABASE rustlegacy;"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: is postgres container running? Try: docker-compose up -d postgres" -ForegroundColor Red
    exit 1
}

Write-Host "Database recreated. Restarting backend..." -ForegroundColor Yellow
docker restart rust-legacy-backend

Write-Host "Done. Backend will run Migrate + Seed on startup." -ForegroundColor Green
