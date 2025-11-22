#!/bin/bash

# Google OAuth Frontend Test Script
# This script helps verify the Google OAuth setup

echo "=================================="
echo "Google OAuth Frontend Test"
echo "=================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "   Please create .env file with VITE_API_URL"
    exit 1
fi

echo "✓ .env file found"

# Check API URL configuration
API_URL=$(grep VITE_API_URL .env | cut -d '=' -f2)
echo "✓ API URL: $API_URL"
echo ""

# Check if backend is running
echo "Checking backend connectivity..."
if curl -s "${API_URL}/v1/auth/google" > /dev/null 2>&1; then
    echo "✓ Backend is reachable"
else
    echo "❌ Warning: Cannot reach backend at ${API_URL}"
    echo "   Make sure your backend server is running"
    echo ""
fi

# Check if required files exist
echo ""
echo "Checking implementation files..."

files=(
    "src/types/auth.ts"
    "src/services/authService.ts"
    "src/contexts/authStore.ts"
    "src/components/Login.tsx"
    "src/components/Signup.tsx"
    "src/components/OAuthCallback.tsx"
    "src/App.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file"
    else
        echo "❌ Missing: $file"
    fi
done

echo ""
echo "=================================="
echo "Test Instructions:"
echo "=================================="
echo "1. Start your backend server"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:5173/login"
echo "4. Click 'Login with Google' button"
echo "5. Authorize with Google"
echo "6. Should redirect to dashboard"
echo ""
echo "Troubleshooting:"
echo "- Check browser console for errors"
echo "- Verify backend GOOGLE_CLIENT_ID is set"
echo "- Verify Google Cloud Console redirect URI"
echo "- Check that cookies are enabled"
echo ""
