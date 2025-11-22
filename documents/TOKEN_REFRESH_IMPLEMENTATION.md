# Token Refresh Implementation - Fix for Token Expiration

## Problem
When authentication token expires, the application was logging out users completely instead of automatically refreshing the token using the `/api/v1/auth/refresh` endpoint.

## Solution
Implemented automatic token refresh mechanism that:
1. Detects 401 Unauthorized responses (token expired)
2. Automatically calls `/v1/auth/refresh` to get a new token
3. Retries the original request with the new token
4. Prevents concurrent refresh attempts
5. Only logs out user if refresh fails

## Changes Made

### 1. **authService.ts** - Fixed Token Refresh Logic
#### Before:
- Used expired token in Authorization header for refresh request
- Always logged out on any refresh failure
- Didn't support storing/using refresh tokens

#### After:
```typescript
async refreshToken(): Promise<string> {
  // Now uses refresh token from localStorage
  const refreshToken = this.getRefreshToken();
  
  // Sends request without Authorization header (uses refresh_token in body)
  const response = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
    body: JSON.stringify({ refresh_token: refreshToken }),
    // ... other config
  });
  
  // Stores new token
  this.storeToken(data.token);
  
  // Stores new refresh token if provided by backend
  if (data.refresh_token) {
    this.storeRefreshToken(data.refresh_token);
  }
}
```

**Key improvements:**
- Uses `refresh_token` from localStorage instead of expired `access_token`
- Properly handles new refresh tokens returned by backend
- Only logs out if refresh token is missing or refresh actually fails

### 2. **authService.ts** - Store Refresh Token on Login/Signup
Both `login()` and `signup()` methods now store the refresh token:
```typescript
// Store refresh token if provided
if (data.refresh_token) {
  this.storeRefreshToken(data.refresh_token);
}
```

### 3. **apiClient.ts** - Enhanced Token Refresh with Concurrency Prevention
#### Added Features:
- **Concurrent request prevention**: Uses a promise lock (`tokenRefreshPromise`) to ensure only one token refresh happens at a time
- **Automatic retry**: Failed requests with 401 status automatically retry with refreshed token
- **Better error handling**: 
  - If retry still fails with 401, user is logged out (prevents infinite loops)
  - Only logs out if token refresh actually fails

#### Before:
```typescript
if (response.status === 401 && !skipAuth) {
  try {
    await authService.refreshToken();
    // Retry with new token
  } catch (refreshError) {
    // Logout
  }
}
```

#### After:
```typescript
if (response.status === 401 && !skipAuth) {
  // Prevent concurrent refresh attempts
  if (!tokenRefreshPromise) {
    tokenRefreshPromise = authService.refreshToken();
  }
  
  const newToken = await tokenRefreshPromise;
  tokenRefreshPromise = null;
  
  if (newToken) {
    // Retry request with new token
    const retryResponse = await fetch(url, {...retryHeaders});
    
    // Don't retry again if still 401 (avoid infinite loop)
    if (retryResponse.status === 401) {
      authService.logout();
      throw new Error('Session expired. Please login again.');
    }
    return retryResponse;
  }
}
```

### 4. **types/auth.ts** - Updated AuthResponse Type
Added optional `refresh_token` to `AuthResponse`:
```typescript
export interface AuthResponse {
  user: User;
  token: string;
  refresh_token?: string;  // Now supported
}
```

## How It Works

### User Flow:
1. User logs in → receives both `access_token` and `refresh_token`
2. Both tokens are stored in localStorage
3. User makes API request with `access_token` in Authorization header
4. If `access_token` expires, backend returns 401
5. **API client automatically:**
   - Detects 401 response
   - Calls `/v1/auth/refresh` with `refresh_token`
   - Gets new `access_token`
   - Retries original request with new token
   - User continues without interruption

### Concurrent Request Handling:
If multiple requests expire simultaneously:
- First request triggers token refresh
- Other requests wait for the refresh to complete
- All requests reuse the same refreshed token
- Prevents multiple simultaneous refresh calls

## Benefits

✅ **Better User Experience**
- No interruption when token expires
- Users stay logged in during token refresh
- Seamless continuation of operations

✅ **Better Security**
- Refresh tokens stored separately from access tokens
- Access tokens are short-lived
- Prevents token reuse attacks

✅ **Better Performance**
- Prevents multiple concurrent refresh requests
- Single token refresh for multiple simultaneous API calls
- No unnecessary logouts

✅ **Better Error Handling**
- Clear distinction between token expiration and actual failures
- Prevents infinite retry loops
- Only logs out when refresh fails

## Backend Requirements

Your `/v1/auth/refresh` endpoint should:

1. **Accept POST request** with refresh token in body:
```json
{
  "refresh_token": "your-refresh-token-here"
}
```

2. **Return new access token**:
```json
{
  "token": "new-access-token",
  "refresh_token": "new-refresh-token (optional)",  // Can be new or same
  "message": "Token refreshed successfully"
}
```

3. **Handle failures gracefully**:
   - Return 401 if refresh token is invalid/expired
   - Return 400 if refresh_token is missing in request
   - Return appropriate error messages

## Testing

To test the implementation:

1. **Manual Test:**
   - Log in to the application
   - Set token expiration to a short time (e.g., 1 minute) on backend
   - Wait for token to expire
   - Make an API request
   - Observe that request succeeds (token auto-refreshed)
   - User should remain logged in

2. **Concurrent Request Test:**
   - Make multiple API requests simultaneously
   - Wait for tokens to expire
   - All requests should succeed with automatic token refresh
   - Only one token refresh should occur

3. **Failed Refresh Test:**
   - Invalidate the refresh token on backend
   - Make an API request
   - Should be redirected to login page
   - Should see "Session expired" message

## Files Modified

1. `src/services/authService.ts` - Fixed token refresh logic
2. `src/utils/apiClient.ts` - Enhanced with concurrency prevention and retry logic
3. `src/types/auth.ts` - Added refresh_token to AuthResponse type

## Notes

- The refresh token is persisted in localStorage under key `refresh_token`
- Access token is persisted in localStorage under key `auth_token`
- Token refresh happens transparently to the user
- Console logs with emoji prefixes help with debugging:
  - 🔑 = Token action
  - ⚠️ = Warning
  - ✅ = Success
  - ❌ = Error
  - 🔄 = Retry
  - 🔴 = Critical error
