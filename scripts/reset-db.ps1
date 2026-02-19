# Reset database: drop, recreate, restart backend (Migrate + Seed)
# Run from project root: .\scripts\reset-db.ps1

$ErrorActionPreference = "Stop"

Write-Host "Stopping backend (disconnect from DB)..." -ForegroundColor Yellow
docker stop rustlegacy-backend 2>$null

Write-Host "Resetting database..." -ForegroundColor Yellow
docker exec rustlegacy-postgres psql -U rustlegacy -d postgres -c "DROP DATABASE IF EXISTS rustlegacy;"
docker exec rustlegacy-postgres psql -U rustlegacy -d postgres -c "CREATE DATABASE rustlegacy;"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: is rustlegacy-postgres running? Try: docker compose up -d" -ForegroundColor Red
    docker start rustlegacy-backend 2>$null
    exit 1
}

Write-Host "Database recreated. Starting backend..." -ForegroundColor Yellow
docker start rustlegacy-backend

Write-Host "Done. Backend will run Migrate + Seed on startup." -ForegroundColor Green
