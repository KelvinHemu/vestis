# Token Refresh Implementation Guide

## Overview

The token refresh endpoint (`/api/v1/auth/refresh`) is now fully implemented in the frontend with automatic token management.

## API Endpoint

- **URL**: `POST /api/v1/auth/refresh`
- **Authentication**: Bearer token in Authorization header
- **Response**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "Token refreshed successfully"
  }
  ```

## Usage Examples

### 1. Using the Auth Store (Recommended)

```typescript
import { useAuthStore } from '@/contexts/authStore';

function MyComponent() {
  const { refreshToken, token, error } = useAuthStore();

  const handleRefreshToken = async () => {
    try {
      await refreshToken();
      console.log('Token refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  };

  return (
    <button onClick={handleRefreshToken}>
      Refresh Token
    </button>
  );
}
```

### 2. Using the Auth Service Directly

```typescript
import authService from '@/services/authService';

async function refreshUserToken() {
  try {
    const newToken = await authService.refreshToken();
    console.log('New token:', newToken);
  } catch (error) {
    console.error('Token refresh failed:', error);
    // User will be logged out automatically
  }
}
```

### 3. Curl Example (Testing)

```bash
curl -X 'POST' \
  'http://localhost:8080/api/v1/auth/refresh' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6ImtlbHZpbkBnbWFpbC5jb20iLCJleHAiOjE3NjE1NDY2MzQsIm5iZiI6MTc2MTQ2MDIzNCwiaWF0IjoxNzYxNDYwMjM0fQ.3IApNS4RgWxpYjU1AgNwmCogRfVNqNxGpNtpdlddIDM' \
  -H 'Content-Type: application/json'
```

## Implementation Details

### Modified Files

1. **`src/types/auth.ts`**
   - Added `RefreshTokenResponse` interface for type-safe responses

2. **`src/services/authService.ts`**
   - Enhanced `refreshToken()` method with proper typing
   - Automatically stores the new token in localStorage
   - Logs out the user if refresh fails

3. **`src/contexts/authStore.ts`**
   - Added `refreshToken()` action to Zustand store
   - Manages loading state during refresh
   - Handles errors gracefully

### Features

✅ Type-safe token refresh
✅ Automatic token storage in localStorage
✅ Automatic logout on refresh failure
✅ Loading state management
✅ Error handling
✅ Full integration with existing auth flow

## Error Handling

If token refresh fails:
- The user will be automatically logged out
- `isAuthenticated` will be set to `false`
- An error message will be stored in the auth store
- The token will be cleared from localStorage

## Token Expiry Strategy

The implementation includes automatic token verification during app initialization:

```typescript
// In AuthProvider or initializeAuth
const isValid = await authService.verifyToken();
if (!isValid) {
  // Token expired, clear auth
  authService.logout();
}
```

For production, consider implementing:
1. **Automatic refresh before expiry** - refresh token 5 minutes before actual expiry
2. **Silent refresh on 401** - refresh token when API returns 401 Unauthorized
3. **Refresh token storage** - store refresh token separately for extended sessions

## Testing

To test the token refresh functionality:

1. Login successfully to get a valid token
2. Call the refresh endpoint with the current token
3. Verify a new token is returned and stored
4. Use the new token for subsequent requests

Example test command:
```bash
sh ./test-auth-api.sh
```
