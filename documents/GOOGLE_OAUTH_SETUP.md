# Google OAuth 2.0 Authentication Setup

This document provides a comprehensive guide to setting up and using Google OAuth 2.0 authentication in the Vestis API.

## Overview

Google OAuth 2.0 allows users to sign in to your application using their Google account. This implementation:

- Supports both new user registration and existing user login via Google
- Automatically links Google accounts to existing email/password users
- Returns JWT tokens (access token and refresh token) after successful authentication
- Activates users automatically since Google verifies email addresses
- Stores OAuth provider information in the database

## Architecture

### Database Schema

The implementation adds two new fields to the `users` table:

- `oauth_provider` (VARCHAR(50), nullable) - The OAuth provider name (e.g., "google")
- `oauth_id` (VARCHAR(255), nullable) - The unique identifier from the OAuth provider
- Unique constraint on `(oauth_provider, oauth_id)` to prevent duplicate OAuth accounts

### Authentication Flow

```
1. User clicks "Sign in with Google" → GET /v1/auth/google
2. Server generates state token and redirects to Google
3. User authorizes on Google's consent page
4. Google redirects back → GET /v1/auth/google/callback?code=...&state=...
5. Server validates state, exchanges code for tokens
6. Server retrieves user info from Google
7. Server creates/finds user in database
8. Server returns JWT tokens to client
```

## Setup Instructions

### 1. Create Google OAuth 2.0 Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - Development: `http://localhost:4000/v1/auth/google/callback`
     - Production: `https://yourdomain.com/v1/auth/google/callback`
   - Save and copy the Client ID and Client Secret

### 2. Configure Environment Variables

Add the following environment variables to your system or `.env` file:

```bash
# Google OAuth 2.0 Configuration
export GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="your-client-secret"
export GOOGLE_REDIRECT_URL="http://localhost:4000/v1/auth/google/callback"
```

For production:
```bash
export GOOGLE_REDIRECT_URL="https://yourdomain.com/v1/auth/google/callback"
```

### 3. Run Database Migration

Run the migration to add OAuth fields to the users table:

```bash
# Using migrate CLI
migrate -path ./migrations -database "postgres://user:pass@localhost:5432/vestis?sslmode=disable" up

# Or using make (if you have a Makefile target)
make db/migrations/up
```

### 4. Start the Server

Start your API server as usual. The OAuth routes are now available:

```bash
go run ./cmd/api
```

## API Endpoints

### Initiate Google OAuth Flow

**Endpoint:** `GET /v1/auth/google`

**Description:** Redirects the user to Google's authorization page

**Response:** HTTP 307 Temporary Redirect to Google

**Example:**
```bash
curl -L "http://localhost:4000/v1/auth/google"
```

### Google OAuth Callback

**Endpoint:** `GET /v1/auth/google/callback`

**Description:** Handles the callback from Google after user authorization

**Query Parameters:**
- `code` (string, required) - Authorization code from Google
- `state` (string, required) - State token for CSRF protection

**Success Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 1800,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "activated": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid state, missing code, or unverified email
- `500 Internal Server Error` - Server-side error during OAuth flow

## Integration Examples

### Web Application (Frontend)

#### JavaScript/TypeScript Example

```javascript
// Redirect user to Google OAuth
function loginWithGoogle() {
  window.location.href = 'http://localhost:4000/v1/auth/google';
}

// Handle callback (if implementing custom redirect handling)
// The callback will include tokens in the response
async function handleGoogleCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  
  // Your backend handles this automatically via the callback endpoint
  // But if you need to process the response:
  const response = await fetch(
    `http://localhost:4000/v1/auth/google/callback?code=${code}&state=${state}`,
    {
      credentials: 'include' // Include cookies for state validation
    }
  );
  
  const data = await response.json();
  
  // Store tokens
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
  
  // Redirect to dashboard or home page
  window.location.href = '/dashboard';
}
```

#### React Example

```typescript
import React from 'react';

const LoginPage: React.FC = () => {
  const handleGoogleLogin = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = `${process.env.REACT_APP_API_URL}/v1/auth/google`;
  };

  return (
    <div>
      <h1>Login</h1>
      <button onClick={handleGoogleLogin}>
        <img src="/google-icon.svg" alt="Google" />
        Sign in with Google
      </button>
    </div>
  );
};

export default LoginPage;
```

### Mobile Application

#### cURL Example (for testing)

```bash
# Step 1: Get the authorization URL
curl -v "http://localhost:4000/v1/auth/google" 2>&1 | grep -i location

# Step 2: Open the URL in a browser, authorize, and copy the callback URL

# Step 3: Extract code and state from the callback URL
# Example callback: http://localhost:4000/v1/auth/google/callback?code=4/0Aa...&state=abc123

# Step 4: Exchange for tokens (automatically handled by visiting the callback URL)
curl "http://localhost:4000/v1/auth/google/callback?code=YOUR_CODE&state=YOUR_STATE"
```

## User Flow Scenarios

### Scenario 1: New User (First-time Google Sign-in)

1. User clicks "Sign in with Google"
2. User authorizes the application on Google
3. **Result:** New user created with:
   - Name from Google profile
   - Email from Google
   - `activated = true` (automatically activated)
   - `oauth_provider = "google"`
   - `oauth_id = Google's user ID`
4. JWT tokens returned to client

### Scenario 2: Existing Google User

1. User previously signed in with Google
2. User clicks "Sign in with Google" again
3. **Result:** 
   - Existing user found by `oauth_provider` and `oauth_id`
   - JWT tokens returned to client

### Scenario 3: Existing Email/Password User

1. User previously registered with email/password
2. User clicks "Sign in with Google" (using same email)
3. **Result:**
   - Existing user found by email
   - Google OAuth credentials linked to existing account
   - `oauth_provider` and `oauth_id` added to user record
   - User can now sign in with either method
   - JWT tokens returned to client

### Scenario 4: Inactive Account

1. User account exists but `activated = false`
2. User attempts to sign in with Google
3. **Result:** `403 Forbidden` - "your user account must be activated to access this resource"

## Security Considerations

### State Token (CSRF Protection)

The implementation uses a state token to prevent Cross-Site Request Forgery (CSRF) attacks:

1. Server generates a random state token before redirecting to Google
2. State token stored in an HTTP-only cookie
3. Google includes the state token in the callback URL
4. Server validates that the state matches before proceeding
5. Cookie is cleared after validation

### Cookie Security

- **HttpOnly:** Prevents JavaScript access to state cookie
- **Secure:** Only sent over HTTPS in production
- **SameSite:** Set to `Lax` to prevent CSRF
- **MaxAge:** 10 minutes (expires quickly)

### Email Verification

The implementation only accepts Google accounts with verified emails (`email_verified = true`). Unverified emails are rejected with a 400 error.

### Password Not Required

OAuth users don't have passwords in the database. The `password_hash` field is nullable, and validation is skipped for OAuth users.

## Troubleshooting

### Error: "state cookie not found"

**Cause:** State cookie was not set or expired

**Solution:** 
- Ensure cookies are enabled in the browser
- Check that the redirect happens within 10 minutes
- Verify cookie settings (Secure flag in production)

### Error: "invalid state parameter"

**Cause:** CSRF attack attempt or cookie/state mismatch

**Solution:**
- Restart the OAuth flow from the beginning
- Clear browser cookies and try again

### Error: "email not verified with Google"

**Cause:** User's Google account email is not verified

**Solution:** 
- User must verify their email with Google
- Use a different Google account

### Error: "a user with this email already exists"

**Cause:** Race condition or database constraint violation

**Solution:**
- This shouldn't happen in normal flow
- Check database for duplicate entries
- Ensure unique constraints are properly set

## Testing

### Manual Testing

1. Start the server: `go run ./cmd/api`
2. Open browser: `http://localhost:4000/v1/auth/google`
3. Authorize with a Google account
4. Verify tokens are returned
5. Use access token to access protected endpoints

### Automated Testing

```go
// Example test for OAuth flow
func TestGoogleOAuth(t *testing.T) {
    // Test state token generation
    state, err := generateStateToken()
    assert.NoError(t, err)
    assert.NotEmpty(t, state)
    
    // Test OAuth config
    config := app.getGoogleOAuthConfig()
    assert.Equal(t, "google", config.Endpoint.AuthURL)
}
```

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [Google Sign-In Best Practices](https://developers.google.com/identity/sign-in/web/sign-in)

## Future Enhancements

Potential improvements for the OAuth implementation:

1. **Multiple OAuth Providers:** Add support for GitHub, Facebook, Apple, etc.
2. **Account Linking UI:** Allow users to link/unlink OAuth providers
3. **OAuth Token Storage:** Store OAuth tokens for API access
4. **Persistent State Storage:** Use Redis/database instead of cookies
5. **Refresh Token Rotation:** Implement refresh token rotation for security
6. **OAuth Scopes Management:** Request additional scopes as needed
7. **Profile Picture:** Store and display Google profile pictures

## Support

For issues or questions:
1. Check this documentation first
2. Review the code in `cmd/api/oauth.go`
3. Check logs for detailed error messages
4. Consult Google's OAuth documentation

