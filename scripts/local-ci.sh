#!/bin/bash

# 本地 CI 脚本 - 替代 GitHub Actions
# 用法: bash scripts/local-ci.sh

set -e

echo "========================================="
echo "Running Local CI"
echo "========================================="

# 1. 代码检查
echo "📋 Step 1: Code quality check..."
cd backend
npm ci
echo "✅ Dependencies installed"

# 2. 构建
echo "🔨 Step 2: Building Docker image..."
cd ..
docker build -t accounting-api:test ./backend
echo "✅ Build successful"

# 3. 启动服务
echo "🚀 Step 3: Starting services..."
docker-compose up -d
echo "✅ Services started"

# 4. 等待服务就绪
echo "⏳ Step 4: Waiting for services to be ready..."
sleep 10

# 5. 健康检查
echo "🏥 Step 5: Health check..."
node backend/health-check.js
echo "✅ Health check passed"

# 6. 运行测试
echo "🧪 Step 6: Running tests..."
bash scripts/test-api.sh
echo "✅ Tests passed"

# 7. 清理
echo "🧹 Step 7: Cleanup..."
docker-compose down

echo "========================================="
echo "✅ All CI checks passed!"
echo "========================================="
