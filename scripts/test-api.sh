#!/bin/bash

# API 测试脚本
# 用于 CI/CD pipeline 中验证 API 端点

set -e

BASE_URL=${API_URL:-http://localhost:3000}
MAX_RETRIES=30
RETRY_DELAY=2

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 等待服务启动
wait_for_service() {
  local retries=0
  echo "Waiting for service at $BASE_URL..."

  while [ $retries -lt $MAX_RETRIES ]; do
    if curl -s -f "$BASE_URL/health" > /dev/null 2>&1; then
      echo -e "${GREEN}✓ Service is ready!${NC}"
      return 0
    fi
    retries=$((retries + 1))
    sleep $RETRY_DELAY
  done

  echo -e "${RED}✗ Service failed to start${NC}"
  return 1
}

# 测试健康检查端点
test_health() {
  echo "Testing /health endpoint..."
  response=$(curl -s "$BASE_URL/health")
  echo "Response: $response"

  if echo "$response" | grep -q '"status":"OK"'; then
    echo -e "${GREEN}✓ Health check passed${NC}"
  else
    echo -e "${RED}✗ Health check failed${NC}"
    return 1
  fi
}

# 测试交易列表端点
test_transactions() {
  echo "Testing /api/transactions endpoint..."
  response=$(curl -s "$BASE_URL/api/transactions")
  echo "Response: $response"

  # 验证响应是有效的 JSON
  if echo "$response" | jq . > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Transactions endpoint passed${NC}"
  else
    echo -e "${RED}✗ Transactions endpoint failed${NC}"
    return 1
  fi
}

# 创建测试交易
test_create_transaction() {
  echo "Testing POST /api/transactions endpoint..."
  response=$(curl -s -X POST "$BASE_URL/api/transactions" \
    -H "Content-Type: application/json" \
    -d '{
      "account_id": 1,
      "amount": 100.50,
      "category": "测试",
      "trans_date": "2024-03-15"
    }')
  echo "Response: $response"

  if echo "$response" | grep -q '"id"'; then
    echo -e "${GREEN}✓ Create transaction passed${NC}"
  else
    echo -e "${RED}✗ Create transaction failed${NC}"
    return 1
  fi
}

# 主测试流程
main() {
  echo "========================================="
  echo "Starting API Tests"
  echo "========================================="

  wait_for_service || exit 1
  test_health || exit 1
  test_transactions || exit 1
  test_create_transaction || exit 1

  echo "========================================="
  echo -e "${GREEN}All tests passed! ✓${NC}"
  echo "========================================="
}

main "$@"
