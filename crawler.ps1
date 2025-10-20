# =========================================
# OpenSanctions Full Pipeline Batch Runner (PowerShell, auto-discovery v3)
# =========================================
param(
    [string]$DatasetRoot = "datasets"  # 탐색할 루트 디렉토리
)

Write-Host "🚀 Starting OpenSanctions full batch pipeline..." -ForegroundColor Cyan
Write-Host "--------------------------------------------"

# 1️⃣ 기존 컨테이너 정리
Write-Host "🧹 Stopping and removing existing containers..." -ForegroundColor Yellow
docker compose down -v | Out-Null

# 2️⃣ DB 컨테이너 실행
Write-Host "🛠️  Building and starting database container..." -ForegroundColor Yellow
docker compose up -d --build db

Write-Host "⏳ Waiting for database to become healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 3️⃣ datasets 디렉터리 내의 모든 .yml 파일 탐색
$datasets = Get-ChildItem -Path $DatasetRoot -Recurse -Filter *.yml

if ($datasets.Count -eq 0) {
    Write-Host "⚠️  No dataset .yml files found under $DatasetRoot" -ForegroundColor Red
    exit 1
}

# 4️⃣ 각 Dataset에 대해 ETL 순차 실행
foreach ($file in $datasets) {
    $datasetPath = $file.FullName -replace '\\', '/'  # 윈도우 경로 → 리눅스 호환
    Write-Host ""
    Write-Host "⚙️  Running ETL for dataset: $datasetPath" -ForegroundColor Cyan
    Write-Host "--------------------------------------------"

    docker compose run --rm zavod bash -c "export DATABASE_URL=postgresql://postgres:password@db:5432/dev && zavod crawl $datasetPath && zavod export $datasetPath && zavod load-db $datasetPath"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Completed: $datasetPath" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed: $datasetPath (check logs above)" -ForegroundColor Red
    }
}
