# OAuth Flow - Next.js Migration Guide

## Overview

This document explains how OAuth authentication works in the migrated Next.js application and how it differs from the previous React (Vite) setup.

## OAuth Flow

### 1. User Initiates Login

**Location:** `src/components/Login.tsx`

```typescript
const handleGoogleLogin = () => {
  authService.initiateGoogleLogin();
};
```

This redirects the user to the backend OAuth endpoint:
```
http://localhost:8080/api/v1/auth/google
```

### 2. Backend Redirects to Google

The backend generates a secure state token and redirects to Google's OAuth consent screen.

### 3. Google Redirects to Backend Callback

After user authorizes, Google redirects back to:
```
http://localhost:8080/api/v1/auth/google/callback?code=...&state=...
```

### 4. Backend Redirects to Frontend with Tokens

**Important:** The backend redirects to the frontend dashboard with tokens in the URL hash:

```
http://localhost:3000/dashboard#access_token=eyJ...&refresh_token=eyJ...&token_type=Bearer&expires_in=1800
```

This is different from query parameters - the hash fragment is **not sent to the server** and can only be accessed by client-side JavaScript.

### 5. Frontend Processes Tokens

**Location:** `src/app/(dashboard)/layout.tsx`

The dashboard layout processes OAuth tokens on mount using the `processOAuthCallback` helper:

```typescript
useEffect(() => {
  const handleOAuthCallback = () => {
    const result = processOAuthCallback();
    
    if (result) {
      loginWithOAuth(result.accessToken, result.user);
    }
  };

  handleOAuthCallback();
}, []);
```

## Key Components

### OAuth Helper (`src/utils/oauthHelper.ts`)

Utility functions for processing OAuth tokens:

- **`extractOAuthTokensFromHash(hash)`** - Extracts tokens from URL hash
- **`decodeJWTToken(token)`** - Decodes JWT to get user info (no verification)
- **`storeOAuthData(tokens, user)`** - Stores tokens and user in localStorage
- **`processOAuthCallback()`** - Main function that orchestrates the entire process

### Dashboard Layout (`src/app/(dashboard)/layout.tsx`)

The dashboard layout handles OAuth token processing **before** checking authentication:

1. **OAuth Processing** (first `useEffect`)
   - Runs once on mount
   - Checks URL hash for OAuth tokens
   - Processes and stores tokens
   - Updates Zustand auth store
   - Cleans URL hash

2. **Authentication Check** (second `useEffect`)
   - Waits for OAuth processing to complete
   - Checks if user is authenticated
   - Redirects to login if not authenticated

### OAuth Callback Page (`src/app/auth/callback/page.tsx`)

Alternative OAuth callback route that can be used if backend redirects to `/auth/callback` instead of `/dashboard`.

Currently, the backend redirects to `/dashboard`, so this route serves as a backup.

## Token Storage

Tokens are stored in multiple locations for redundancy and state management:

1. **localStorage** (persistence across sessions)
   - `auth_token` - Access token (JWT)
   - `refresh_token` - Refresh token for getting new access tokens
   - `auth_user` - User information (id, email, name)

2. **Zustand Store** (runtime state management)
   - `token` - Current access token
   - `user` - Current user object
   - `isAuthenticated` - Boolean flag
   - `isInitialized` - Whether auth has been initialized

## Migration Changes

### Before (React/Vite)

- OAuth tokens processed in main `App.tsx` or route components
- Used React Router for navigation
- Token processing happened at component level

### After (Next.js)

- OAuth tokens processed in **layout** before content renders
- Uses Next.js App Router navigation
- Token processing happens at **layout level** to prevent race conditions
- Centralized OAuth helper utility for consistency

## Troubleshooting

### Issue: Redirect loop to login

**Cause:** OAuth tokens not being processed before authentication check

**Solution:** Ensure the dashboard layout's OAuth processing `useEffect` runs before the authentication check. The layout now uses two separate effects with proper dependencies.

### Issue: Tokens not persisted

**Cause:** LocalStorage not being written properly

**Solution:** Check the `oauthHelper.ts` `storeOAuthData` function is being called and browser allows localStorage.

### Issue: User gets redirected even with valid tokens

**Cause:** Auth initialization happens before OAuth processing

**Solution:** The layout now waits for `isProcessingOAuth` to complete before checking authentication.

## Testing OAuth Flow

1. Start backend server: `http://localhost:8080`
2. Start frontend: `npm run dev` (http://localhost:3000)
3. Navigate to: `http://localhost:3000/login`
4. Click "Continue with Google"
5. Watch browser console for log messages:
   - 🔍 Checking for OAuth tokens in URL hash...
   - 🔐 OAuth tokens found and processed!
   - ✅ OAuth authentication successful!

## Backend Configuration

The backend should redirect to:
```
http://localhost:3000/dashboard#access_token=...&refresh_token=...
```

If you want to change the redirect to `/auth/callback`, update the backend OAuth redirect URL configuration.

## Security Considerations

1. **Token Exposure** - Tokens are in URL hash (not query params), so they're not sent to server or logged
2. **Token Validation** - Backend validates and signs tokens before sending
3. **HTTPS Required** - In production, use HTTPS to prevent token interception
4. **Token Expiry** - Access tokens expire after 30 minutes (1800 seconds)
5. **Refresh Tokens** - Used to get new access tokens without re-authenticating

## Next Steps

After OAuth authentication is working:

1. ✅ Verify token refresh mechanism works
2. ✅ Test token expiry and automatic refresh
3. ✅ Ensure protected routes properly check authentication
4. ✅ Test logout flow clears all stored tokens




