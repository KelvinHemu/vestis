# OAuth Authentication - Testing Checklist

## Pre-Test Setup

- [ ] Backend is running on `http://localhost:8080`
- [ ] Frontend is running on `http://localhost:3000`
- [ ] Browser console is open for debugging
- [ ] Network tab is open to monitor requests
- [ ] localStorage is cleared (optional - for clean test)

## Test 1: Google OAuth Login (Happy Path)

### Steps:
1. [ ] Navigate to `http://localhost:3000/login`
2. [ ] Click "Continue with Google" button
3. [ ] Redirected to Google OAuth consent screen
4. [ ] Select/authorize Google account
5. [ ] Redirected back to frontend

### Expected Results:
- [ ] URL briefly shows: `http://localhost:3000/dashboard#access_token=...&refresh_token=...`
- [ ] Console logs appear in order:
  ```
  🔍 Checking for OAuth tokens in URL hash...
  🔐 OAuth tokens found and processed!
  ✅ OAuth authentication successful!
  ```
- [ ] URL hash is cleaned to: `http://localhost:3000/dashboard`
- [ ] Dashboard page loads successfully
- [ ] Sidebar is visible
- [ ] User stays on dashboard (no redirect loop)
- [ ] localStorage contains:
  - `auth_token` (JWT string)
  - `refresh_token` (JWT string)
  - `auth_user` (JSON with id, email)

### Backend Logs to Check:
```
INF redirecting user to Google OAuth
INF existing Google user logged in email=... user_id=...
INF Google OAuth login successful
INF redirecting to frontend with tokens redirect_url=http://localhost:3000/dashboard#access_token=...
```

---

## Test 2: Page Refresh After Login

### Steps:
1. [ ] Complete Test 1 successfully
2. [ ] Refresh the dashboard page (`F5` or Ctrl+R)

### Expected Results:
- [ ] Page reloads
- [ ] User remains logged in
- [ ] Dashboard displays immediately
- [ ] No redirect to login page
- [ ] Console shows: `ℹ️ No OAuth tokens found in URL` (expected - no hash on refresh)

---

## Test 3: Navigate to Other Dashboard Pages

### Steps:
1. [ ] Complete Test 1 successfully
2. [ ] Click sidebar links to navigate:
   - [ ] On Model Photos
   - [ ] Flat Lay Photos
   - [ ] Models
   - [ ] Profile

### Expected Results:
- [ ] All pages load successfully
- [ ] User remains authenticated
- [ ] No redirect to login
- [ ] Sidebar remains visible

---

## Test 4: Direct URL Access While Logged In

### Steps:
1. [ ] Complete Test 1 successfully
2. [ ] Manually navigate to: `http://localhost:3000/flat-lay-photos`

### Expected Results:
- [ ] Page loads successfully
- [ ] User remains authenticated
- [ ] Dashboard layout renders

---

## Test 5: Logout Flow

### Steps:
1. [ ] Complete Test 1 successfully
2. [ ] Click logout button in sidebar/profile
3. [ ] Check logout behavior

### Expected Results:
- [ ] Redirected to `/login`
- [ ] localStorage is cleared:
  - `auth_token` removed
  - `refresh_token` removed
  - `auth_user` removed
- [ ] Zustand store cleared:
  - `isAuthenticated = false`
  - `user = null`
  - `token = null`

---

## Test 6: Protected Route Access (Not Logged In)

### Steps:
1. [ ] Clear localStorage or logout
2. [ ] Navigate directly to: `http://localhost:3000/dashboard`

### Expected Results:
- [ ] Brief loading spinner appears
- [ ] Console shows: `ℹ️ No OAuth tokens found in URL`
- [ ] Console shows: `Dashboard: Not authenticated, redirecting to login`
- [ ] Redirected to `/login`

---

## Test 7: OAuth Callback Route (Alternative)

### Steps:
1. [ ] Manually navigate to: `http://localhost:3000/auth/callback#access_token=...` (use tokens from backend log)

### Expected Results:
- [ ] Tokens processed
- [ ] Redirected to `/dashboard`
- [ ] User successfully authenticated

---

## Test 8: Token Expiry & Refresh

### Steps:
1. [ ] Complete Test 1 successfully
2. [ ] Wait 30 minutes (or modify token expiry for faster testing)
3. [ ] Make an API request (e.g., fetch models)

### Expected Results:
- [ ] API returns 401 (token expired)
- [ ] apiClient automatically calls refresh endpoint
- [ ] New access token retrieved
- [ ] localStorage updated with new token
- [ ] Original API request retried and succeeds
- [ ] Console shows: `✅ Token refreshed successfully`

---

## Test 9: Invalid Token in URL

### Steps:
1. [ ] Navigate to: `http://localhost:3000/dashboard#access_token=invalid_token`

### Expected Results:
- [ ] Console shows: `🔍 Checking for OAuth tokens in URL hash...`
- [ ] Console shows: `❌ Failed to process OAuth tokens:` (error details)
- [ ] URL hash cleaned
- [ ] User redirected to `/login` (not authenticated)

---

## Test 10: Multiple Google Accounts

### Steps:
1. [ ] Complete Test 1 with first Google account
2. [ ] Logout
3. [ ] Login with different Google account

### Expected Results:
- [ ] New user account created (if new) OR existing user logged in
- [ ] localStorage updated with new tokens
- [ ] Dashboard loads with correct user email

---

## Common Issues & Solutions

### Issue: Redirect loop to login
**Symptoms:** Constantly redirected to /login even after OAuth
**Check:**
- [ ] Console shows "🔐 OAuth tokens found and processed!"
- [ ] localStorage contains `auth_token`
- [ ] Zustand store `isAuthenticated = true`
**Solution:** Ensure OAuth processing completes before auth check

### Issue: Blank screen after OAuth
**Symptoms:** White screen, no content
**Check:**
- [ ] Browser console for errors
- [ ] React error boundary triggered
- [ ] Component rendering issues
**Solution:** Check component code and React DevTools

### Issue: Tokens not stored
**Symptoms:** OAuth completes but tokens not in localStorage
**Check:**
- [ ] Console shows "🔐 OAuth tokens found and processed!"
- [ ] localStorage.setItem() not blocked by browser
- [ ] Private/incognito mode restrictions
**Solution:** Check browser localStorage permissions

### Issue: Backend not redirecting correctly
**Symptoms:** Never reach frontend after Google authorization
**Check:**
- [ ] Backend logs show: "redirecting to frontend with tokens"
- [ ] Backend redirect URL is correct: `http://localhost:3000/dashboard`
- [ ] CORS configured properly
**Solution:** Check backend OAuth configuration

---

## Performance Metrics

### Expected Load Times:
- [ ] OAuth processing: < 100ms
- [ ] Dashboard first paint: < 500ms
- [ ] Full dashboard interactive: < 1000ms

### Network Requests:
- [ ] Google OAuth redirect: 1 request
- [ ] Backend OAuth callback: 1 request
- [ ] Frontend OAuth processing: 0 network requests (client-side only)

---

## Browser Compatibility

Test on:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Mobile browsers (Chrome Mobile, Safari iOS)

---

## Security Checks

- [ ] Tokens not visible in URL after processing (hash cleaned)
- [ ] Tokens not in browser history
- [ ] Tokens not in network logs (hash not sent to server)
- [ ] LocalStorage secure (HTTPS in production)
- [ ] JWT tokens properly formatted and decodable

---

## Documentation

After successful testing:
- [ ] Update README.md with OAuth setup instructions
- [ ] Document environment variables needed
- [ ] Add troubleshooting section
- [ ] Create user guide for OAuth flow

---

## Sign-off

**Tester:** _______________  
**Date:** _______________  
**Result:** ☐ Pass ☐ Fail  
**Notes:** 
```
[Add any observations or issues here]
```



