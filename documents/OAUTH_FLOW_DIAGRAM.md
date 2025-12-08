# OAuth Authentication Flow - Visual Guide

## Current Implementation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         OAUTH LOGIN FLOW                            │
└─────────────────────────────────────────────────────────────────────┘

1. USER CLICKS "CONTINUE WITH GOOGLE"
   ↓
   [Frontend: Login.tsx]
   authService.initiateGoogleLogin()
   ↓
   window.location.href = "http://localhost:8080/api/v1/auth/google"


2. BACKEND REDIRECTS TO GOOGLE
   ↓
   [Backend: OAuth Handler]
   Generates state token
   ↓
   Redirect to: https://accounts.google.com/o/oauth2/auth?...


3. USER AUTHORIZES ON GOOGLE
   ↓
   [Google OAuth Consent Screen]
   User approves permissions
   ↓
   Redirect to: http://localhost:8080/api/v1/auth/google/callback?code=...


4. BACKEND PROCESSES CALLBACK
   ↓
   [Backend: OAuth Callback Handler]
   - Validates state token
   - Exchanges code for Google tokens
   - Gets user info from Google
   - Creates/finds user in database
   - Generates JWT access token
   - Generates refresh token
   ↓
   Redirect to: http://localhost:3000/dashboard#access_token=...&refresh_token=...


5. FRONTEND PROCESSES TOKENS
   ↓
   [Frontend: Dashboard Layout]
   
   A. OAuth Processing (First useEffect - runs once on mount)
      ├─ Check URL hash for tokens
      ├─ Extract access_token & refresh_token
      ├─ Decode JWT to get user info
      ├─ Store in localStorage
      │  ├─ auth_token
      │  ├─ refresh_token
      │  └─ auth_user
      ├─ Update Zustand store (loginWithOAuth)
      └─ Clean URL hash
   
   B. Authentication Check (Second useEffect)
      ├─ Wait for OAuth processing (isProcessingOAuth)
      ├─ Wait for initialization (isInitialized)
      ├─ Check if authenticated (isAuthenticated)
      └─ If not authenticated → redirect to /login
   
   C. Render Dashboard
      └─ User successfully logged in! ✅


┌─────────────────────────────────────────────────────────────────────┐
│                         STATE MANAGEMENT                            │
└─────────────────────────────────────────────────────────────────────┘

localStorage (Persistent)           Zustand Store (Runtime)
├─ auth_token                      ├─ token
├─ refresh_token                   ├─ refreshToken
└─ auth_user                       ├─ user
                                   ├─ isAuthenticated
                                   └─ isInitialized


┌─────────────────────────────────────────────────────────────────────┐
│                      TOKEN STRUCTURE                                │
└─────────────────────────────────────────────────────────────────────┘

JWT Access Token (decoded):
{
  "user_id": 1,
  "email": "user@example.com",
  "exp": 1765132105,        // Expires in 30 minutes
  "iat": 1765130305,        // Issued at
  "jti": "1-1765130305"     // JWT ID
}

Refresh Token (decoded):
{
  "user_id": 1,
  "email": "user@example.com",
  "exp": 1765216705,        // Expires in 24 hours
  "iat": 1765130305,
  "jti": "refresh-1-1765130305"
}


┌─────────────────────────────────────────────────────────────────────┐
│                      COMPONENT HIERARCHY                            │
└─────────────────────────────────────────────────────────────────────┘

Root Layout
└─ Providers
   ├─ QueryClientProvider
   └─ AuthProvider (initializes auth from localStorage)

Dashboard Layout
├─ OAuth Processing (useEffect #1)
├─ Auth Check (useEffect #2)
└─ Sidebar + Content
   └─ Dashboard Page


┌─────────────────────────────────────────────────────────────────────┐
│                      ERROR HANDLING                                 │
└─────────────────────────────────────────────────────────────────────┘

Scenario 1: No tokens in URL hash
   → isProcessingOAuth completes immediately
   → Auth check runs
   → If not authenticated → redirect to /login

Scenario 2: Invalid token format
   → processOAuthCallback() catches error
   → Logs error to console
   → isProcessingOAuth completes
   → User redirected to /login

Scenario 3: Token expired
   → Token stored but expired
   → apiClient intercepts 401 response
   → Attempts token refresh
   → If refresh fails → logout + redirect to /login


┌─────────────────────────────────────────────────────────────────────┐
│                      TIMING DIAGRAM                                 │
└─────────────────────────────────────────────────────────────────────┘

Time    Component                   Action
──────────────────────────────────────────────────────────────────────
0ms     Browser                     Navigate to /dashboard#access_token=...
10ms    Root Layout                 Mounts
15ms    Providers                   Mount
20ms    AuthProvider                initializeAuth() starts
25ms    Dashboard Layout            Mounts
30ms    Dashboard Layout            useEffect #1 (OAuth processing) runs
35ms    oauthHelper                 processOAuthCallback() executes
40ms    localStorage                Tokens stored
45ms    Zustand Store               loginWithOAuth() updates state
50ms    Dashboard Layout            isProcessingOAuth = false
55ms    Dashboard Layout            useEffect #2 (auth check) runs
60ms    Dashboard Layout            isAuthenticated = true ✅
65ms    Dashboard Layout            Renders sidebar + content
70ms    Dashboard Page              Renders
──────────────────────────────────────────────────────────────────────


┌─────────────────────────────────────────────────────────────────────┐
│                      KEY TAKEAWAYS                                  │
└─────────────────────────────────────────────────────────────────────┘

1. ✅ Tokens are in URL HASH (#), not query params (?)
   - Hash is not sent to server
   - Only accessible via JavaScript
   
2. ✅ OAuth processing happens BEFORE auth check
   - First useEffect processes tokens
   - Second useEffect checks authentication
   
3. ✅ Centralized OAuth logic in oauthHelper.ts
   - Single source of truth
   - Reusable across components
   
4. ✅ Proper state management prevents race conditions
   - isProcessingOAuth flag
   - Dependency arrays control execution order
   
5. ✅ User experience optimized
   - Shows "Signing you in..." during processing
   - Clean URL after token processing
   - No redirect loops



