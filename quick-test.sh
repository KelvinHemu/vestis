#!/bin/bash
# Quick Test Commands for Authentication API

echo "========================================="
echo "Vestis Backend Integration - Quick Tests"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variables
API="http://localhost:8080/api/v1/auth"
EMAIL="kelvin@gmail.com"
PASSWORD="Lionleon30"

echo -e "${BLUE}1. LOGIN TEST${NC}"
echo "Endpoint: POST /api/v1/auth/login"
echo "Request:"
echo "  Email: $EMAIL"
echo "  Password: $PASSWORD"
echo ""
echo "Running..."
LOGIN_RESPONSE=$(curl -s -X POST "$API/login" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'X-Requested-With: XMLHttpRequest' \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

echo "$LOGIN_RESPONSE" | jq '.'
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token' 2>/dev/null)
echo ""

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✓ Login successful!${NC}"
  echo "Token received: ${TOKEN:0:50}..."
  echo ""
  
  echo -e "${BLUE}2. VERIFY TOKEN TEST${NC}"
  echo "Endpoint: GET /api/v1/auth/verify"
  echo "Running..."
  curl -s -X GET "$API/verify" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
  echo ""
  
  echo -e "${GREEN}✓ Verification test completed!${NC}"
else
  echo -e "${RED}✗ Login failed!${NC}"
  echo "Make sure backend is running:"
  echo "  go run ./cmd/server"
fi

echo ""
echo "========================================="
echo "Testing Complete"
echo "========================================="
