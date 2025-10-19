#!/bin/bash
# =========================================
# OpenSanctions Full Pipeline Starter
# =========================================
# 실행 흐름:
# 1. DB 초기화 (postgres)
# 2. Zavod ETL 데이터 적재
# 3. Zavod UI 구동
# =========================================

set -e

echo "🚀 Starting OpenSanctions full environment..."
echo "--------------------------------------------"

# 1️⃣ 기존 컨테이너 종료 및 정리
docker compose down -v || true

# 2️⃣ 빌드 및 전체 서비스 실행 (백그라운드)
docker compose up -d --build db
echo "⏳ Waiting for database to become healthy..."
sleep 10

# 3️⃣ Zavod ETL 실행
# echo "⚙️  Running Zavod ETL..."
# docker compose run --rm zavod zavod run datasets/us/ofac/us_ofac_sdn.yml

# 4️⃣ Zavod UI 구동
echo "🌐 Starting Zavod UI..."
docker compose up -d web

# 5️⃣ 실행 상태 표시
echo ""
echo "--------------------------------------------"
echo "✅ All systems are up and running!"
echo "   - PostgreSQL:   localhost:5432"
echo "   - Zavod UI:     http://localhost:3000"
echo "--------------------------------------------"

# 6️⃣ 실시간 로그 보기
echo ""
docker compose logs -f web
