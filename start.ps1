# =========================================
# OpenSanctions Full Pipeline Starter (PowerShell, fixed v2)
# =========================================
param(
    [string]$Dataset = "datasets/nl/terrorism_list/nl_terrorism_list.yml"
)

Write-Host "🚀 Starting OpenSanctions full environment..." -ForegroundColor Cyan
Write-Host "--------------------------------------------"

# 1️⃣ 기존 컨테이너 종료 및 정리
Write-Host "🧹 Stopping and removing existing containers..." -ForegroundColor Yellow
docker compose down -v | Out-Null

# 2️⃣ DB 컨테이너 빌드 및 실행
Write-Host "🛠️  Building and starting database container..." -ForegroundColor Yellow
docker compose up -d --build db

Write-Host "⏳ Waiting for database to become healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 3️⃣ Zavod ETL 실행 (crawl → export → load-db)
Write-Host "⚙️  Running Zavod ETL (crawl → export → load-db)..." -ForegroundColor Cyan

docker compose run --rm zavod bash -c "export DATABASE_URL=postgresql://postgres:password@db:5432/dev && zavod crawl $Dataset && zavod export $Dataset && zavod load-db $Dataset"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ETL pipeline completed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ ETL pipeline failed. Check logs above." -ForegroundColor Red
    exit 1
}

# 4️⃣ Zavod UI 구동
Write-Host "🌐 Starting Zavod UI..." -ForegroundColor Green
docker compose up -d web

# 5️⃣ 실행 상태 표시
Write-Host ""
Write-Host "--------------------------------------------" -ForegroundColor Cyan
Write-Host "✅ All systems are up and running!" -ForegroundColor Green
Write-Host "   - PostgreSQL:   localhost:5432"
Write-Host "   - Zavod UI:     http://localhost:3000"
Write-Host "   - Dataset:      $Dataset"
Write-Host "--------------------------------------------"

# 6️⃣ 실시간 로그 보기
Write-Host ""
Write-Host "📜 Showing live logs for Zavod UI..." -ForegroundColor Yellow
docker compose logs -f web
