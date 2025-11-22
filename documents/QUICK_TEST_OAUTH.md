# Quick Test Guide - Google OAuth

## 🚀 Quick Start

### 1. Prerequisites
Ensure your backend is running with these environment variables:
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
GOOGLE_REDIRECT_URL=http://localhost:4000/v1/auth/google/callback
```

### 2. Start Frontend
```bash
cd vestis
npm run dev
```
The app will run at: http://localhost:5173/

### 3. Test the Flow

#### Option A: Login Page
1. Navigate to: http://localhost:5173/login
2. Look for the "Login with Google" button (has Google icon)
3. Click it
4. You'll be redirected to Google's authorization page
5. Sign in and authorize
6. You'll be redirected back and logged in
7. Should land on: http://localhost:5173/dashboard

#### Option B: Signup Page
1. Navigate to: http://localhost:5173/signup
2. Look for the "Sign up with Google" button (has Google icon)
3. Click it
4. Same flow as login
5. New accounts are created automatically

### 4. Verify Success

After successful authentication, check:

**Browser DevTools → Console:**
- No errors should appear

**Browser DevTools → Application → Local Storage:**
- `auth_token` - Should contain JWT access token
- `refresh_token` - Should contain refresh token
- `auth_user` - Should contain user JSON data

**Current Page:**
- Should be at `/dashboard`
- Sidebar should show user authenticated state

### 5. What to Expect

#### During OAuth Flow:
- Redirect to Google (google.com/accounts/...)
- Google login/consent screen
- Redirect back to app (localhost:5173/auth/callback)
- Loading spinner: "Signing you in..."
- Redirect to dashboard

#### After Login:
- User is fully authenticated
- Can access protected routes
- Tokens stored in localStorage
- Can navigate to On-Model Photos, Flat-Lay, etc.

## 🔍 Debugging

### Check Network Tab
1. Open DevTools → Network tab
2. Click "Login with Google"
3. Look for these requests:
   - Initial redirect to `/v1/auth/google`
   - Redirect to `accounts.google.com`
   - Callback to `/v1/auth/google/callback?code=...&state=...`
   - Should return 200 with JSON containing tokens

### Common Issues

#### Issue: "Redirect URI Mismatch"
```
Error: redirect_uri_mismatch
```
**Fix:** 
- Go to Google Cloud Console
- Add exact backend URL to authorized redirect URIs
- Example: `http://localhost:4000/v1/auth/google/callback`

#### Issue: Button Does Nothing
**Check:**
1. Browser console for JavaScript errors
2. Network tab - is the request going out?
3. VITE_API_URL in .env file
4. Backend is actually running

#### Issue: Error After Google Authorization
**Check:**
1. Backend logs for errors
2. GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set
3. Google account email is verified
4. State cookie validation passed

#### Issue: Stuck on Loading Screen
**Check:**
1. Browser console for errors
2. Network request to callback endpoint succeeded
3. Response contains access_token and user data
4. localStorage has the tokens stored

## 🎯 Quick Verification Commands

### Check if backend is running:
```bash
curl http://localhost:8080/api/v1/auth/google
```
Should redirect (307) to Google

### Check environment:
```bash
cat .env | grep VITE_API_URL
```
Should show: `VITE_API_URL=http://localhost:8080/api`

### Check files exist:
```bash
ls -la src/components/OAuthCallback.tsx
ls -la src/services/authService.ts
```

## 📸 What You'll See

### Login Page
- "Login with Google" button with Google icon
- Below the email/password form
- After "Or continue with" divider

### Signup Page
- "Sign up with Google" button with Google icon
- Same styling as login button
- Below the password confirmation field

### OAuth Callback Page
- Clean white page
- Spinning loader icon
- "Signing you in..." text
- Or error message with warning icon if failed

### Dashboard (After Success)
- Three feature cards
- Sidebar with navigation
- Topbar with user info
- Full app access

## ✅ Success Criteria

You know it's working when:
1. ✅ Clicking button redirects to Google
2. ✅ Can sign in with Google account
3. ✅ Redirected back to app
4. ✅ See loading screen briefly
5. ✅ Land on dashboard
6. ✅ Can navigate to other pages
7. ✅ Tokens visible in localStorage
8. ✅ No console errors

## 🎉 You're All Set!

If all the above works, your Google OAuth integration is functioning perfectly!

## Need Help?

Check these files for more details:
- `GOOGLE_OAUTH_IMPLEMENTATION_SUMMARY.md` - What was implemented
- `GOOGLE_OAUTH_FRONTEND_SETUP.md` - Detailed technical guide
- `GOOGLE_OAUTH_SETUP.md` - Backend setup guide
