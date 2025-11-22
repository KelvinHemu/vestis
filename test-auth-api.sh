#!/bin/bash

# API Integration Testing Script
# This script helps test the frontend-backend integration

API_URL="http://localhost:8080/api/v1/auth"

echo "================================"
echo "Authentication API Testing"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Login with existing credentials
echo -e "${YELLOW}Test 1: Login with existing user${NC}"
echo "Endpoint: POST /api/v1/auth/login"
echo "Request:"
echo '{
  "email": "kelvin@gmail.com",
  "password": "Lionleon30"
}'
echo ""
echo "Response:"
curl -s -X 'POST' \
  "$API_URL/login" \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-Requested-With: XMLHttpRequest' \
  -d '{
  "email": "kelvin@gmail.com",
  "password": "Lionleon30"
}' | jq '.'
echo ""
echo ""

# Test 2: Register new user
echo -e "${YELLOW}Test 2: Register new user${NC}"
TEST_EMAIL="user_$(date +%s)@example.com"
echo "Endpoint: POST /api/v1/auth/register"
echo "Request:"
echo "{
  \"name\": \"Test User\",
  \"email\": \"$TEST_EMAIL\",
  \"password\": \"TestPass123\"
}"
echo ""
echo "Response:"
REGISTER_RESPONSE=$(curl -s -X 'POST' \
  "$API_URL/register" \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-Requested-With: XMLHttpRequest' \
  -d "{
  \"name\": \"Test User\",
  \"email\": \"$TEST_EMAIL\",
  \"password\": \"TestPass123\"
}")
echo "$REGISTER_RESPONSE" | jq '.'
echo ""

# Extract token for verification
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token' 2>/dev/null)
if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo ""
  echo -e "${YELLOW}Test 3: Verify token${NC}"
  echo "Endpoint: GET /api/v1/auth/verify"
  echo "Token: ${TOKEN:0:50}..."
  echo ""
  echo "Response:"
  curl -s -X 'GET' \
    "$API_URL/verify" \
    -H 'Authorization: Bearer '"$TOKEN" | jq '.'
  echo ""
fi

echo ""
echo -e "${GREEN}Testing completed!${NC}"
echo ""
echo "================================"
echo "Connection Status:"
echo "================================"
if nc -z localhost 8080 2>/dev/null; then
  echo -e "${GREEN}✓ Backend is running on localhost:8080${NC}"
else
  echo -e "${RED}✗ Cannot connect to backend on localhost:8080${NC}"
  echo "Make sure your backend server is running:"
  echo "  go run ./cmd/server"
fi
