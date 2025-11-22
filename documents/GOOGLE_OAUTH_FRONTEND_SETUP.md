# Google OAuth Frontend Setup Guide

## Overview

This document explains the Google OAuth implementation in the Vestis frontend application.

## Architecture

### Flow Diagram

```
1. User clicks "Sign in with Google" button
   ↓
2. Frontend redirects to: http://localhost:8080/api/v1/auth/google
   ↓
3. Backend generates state token and redirects to Google
   ↓
4. User authorizes on Google's consent page
   ↓
5. Google redirects to: http://localhost:8080/api/v1/auth/google/callback?code=...&state=...
   ↓
6. Backend validates, creates/finds user, returns tokens
   ↓
7. Frontend receives tokens and user data
   ↓
8. Frontend stores tokens and redirects to /dashboard
```

## Implementation Details

### 1. Environment Configuration

The frontend uses the backend API URL from environment variables:

```bash
VITE_API_URL=http://localhost:8080/api
```

### 2. Updated Files

#### `src/types/auth.ts`
- Added `OAuthResponse` interface to handle OAuth callback response with `access_token` and `refresh_token`

#### `src/services/authService.ts`
- Added `initiateGoogleLogin()` - Redirects to backend OAuth endpoint
- Added `handleOAuthCallback()` - Handles OAuth callback and stores tokens
- Added `REFRESH_TOKEN_KEY` constant for storing refresh tokens
- Added `storeRefreshToken()` and `getRefreshToken()` methods

#### `src/contexts/authStore.ts`
- Added `loginWithOAuth()` method to update auth state after OAuth login

#### `src/components/OAuthCallback.tsx` (NEW)
- Handles the OAuth callback redirect from the backend
- Extracts code and state from URL parameters
- Calls authService to complete authentication
- Updates auth store and redirects to dashboard
- Shows loading spinner and error states

#### `src/components/Login.tsx`
- Updated "Login with Google" button with onClick handler
- Redirects to `${API_URL}/v1/auth/google`

#### `src/components/Signup.tsx`
- Updated "Sign up with Google" button with onClick handler
- Redirects to `${API_URL}/v1/auth/google`

#### `src/App.tsx`
- Added route `/auth/callback` for handling OAuth redirect

## Backend Configuration Required

According to the `GOOGLE_OAUTH_SETUP.md`, the backend needs:

```bash
# Google OAuth 2.0 Configuration
export GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="your-client-secret"
export GOOGLE_REDIRECT_URL="http://localhost:4000/v1/auth/google/callback"
```

### Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google+ API
3. Create OAuth 2.0 Client ID
4. Add authorized redirect URI:
   - Development: `http://localhost:4000/v1/auth/google/callback`
   - Or your backend URL: `http://localhost:8080/api/v1/auth/google/callback`

**Note:** The redirect URI in Google Console MUST match the backend's `GOOGLE_REDIRECT_URL` exactly.

## Token Management

The frontend stores three pieces of data:

1. **Access Token** (`auth_token`) - Used for API requests
2. **Refresh Token** (`refresh_token`) - Used to get new access tokens
3. **User Data** (`auth_user`) - User profile information

These are stored in localStorage and persisted via Zustand's persist middleware.

## Security Features

1. **State Token Validation** - Backend validates CSRF state token
2. **HttpOnly Cookies** - State token stored in secure cookie
3. **Email Verification** - Only Google accounts with verified emails are accepted
4. **Token Expiration** - Access tokens expire after 30 minutes (1800 seconds)

## Testing the Implementation

### Manual Testing Steps

1. Start the backend server (ensure it's running on port 4000 or 8080)
2. Start the frontend server:
   ```bash
   npm run dev
   ```
3. Navigate to http://localhost:5173/login
4. Click "Login with Google"
5. Authorize with your Google account
6. Verify redirect to dashboard
7. Check browser localStorage for tokens:
   ```javascript
   localStorage.getItem('auth_token')
   localStorage.getItem('refresh_token')
   localStorage.getItem('auth_user')
   ```

### Testing Different Scenarios

#### New User (First-time Google Sign-in)
- User should be created automatically
- User should be redirected to dashboard
- Account should be activated automatically

#### Existing Google User
- User should be logged in immediately
- Previous sessions should be preserved

#### Existing Email/Password User
- Google account should be linked to existing account
- User can now sign in with either method

## Error Handling

The implementation handles several error cases:

1. **Missing Code/State** - Shows error and redirects to login
2. **Invalid State** - Backend rejects request (CSRF protection)
3. **Unverified Email** - Backend rejects with 400 error
4. **Network Errors** - Shows error message with retry option

## Troubleshooting

### Issue: "Redirect URI Mismatch"
**Solution:** Ensure the redirect URI in Google Cloud Console matches the backend's `GOOGLE_REDIRECT_URL` exactly.

### Issue: "state cookie not found"
**Solution:** 
- Clear browser cookies
- Ensure cookies are enabled
- Check that redirect happens within 10 minutes

### Issue: Blank screen after OAuth
**Solution:**
- Check browser console for errors
- Verify backend is running and accessible
- Check that tokens are being stored in localStorage

### Issue: Backend not receiving OAuth callback
**Solution:**
- Verify backend is running on the correct port
- Check `VITE_API_URL` in .env matches backend URL
- Ensure Google Cloud Console has correct redirect URI

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/auth/google` | GET | Initiate OAuth flow |
| `/v1/auth/google/callback` | GET | Handle OAuth callback |

## Frontend Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/login` | Login | Login page with Google OAuth button |
| `/signup` | Signup | Signup page with Google OAuth button |
| `/auth/callback` | OAuthCallback | Handles OAuth redirect |
| `/dashboard` | Dashboard | Protected route after login |

## Future Enhancements

1. **Add Apple Sign-In** - Similar OAuth flow for Apple
2. **Add Facebook Login** - Facebook OAuth integration
3. **Account Linking UI** - Allow users to link/unlink OAuth providers
4. **Profile Pictures** - Display Google profile pictures
5. **Token Refresh** - Automatic token refresh before expiration

## Support

For issues:
1. Check this documentation
2. Review browser console for errors
3. Check backend logs
4. Verify Google Cloud Console configuration
5. Review `GOOGLE_OAUTH_SETUP.md` for backend setup
