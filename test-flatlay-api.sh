#!/bin/bash

# Test Flatlay Generation API
# This script tests if the flatlay generation endpoint is implemented

echo "Testing Flatlay Generation API..."
echo "=================================="
echo ""

# Get your auth token (replace with a real token from localStorage)
TOKEN="YOUR_AUTH_TOKEN_HERE"

echo "1. Testing with minimal payload..."
curl -X POST http://localhost:8080/api/v1/flatlay/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "products": [{
      "type": "top",
      "frontImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    }],
    "modelId": "1",
    "backgroundId": 1,
    "options": {
      "quality": "high",
      "format": "png"
    }
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -v

echo ""
echo "=================================="
echo "Test complete!"

