# Backend Integration Setup Complete ✅

## Overview

Your frontend is fully configured to integrate with your backend running at `http://localhost:8080`.

## Current Configuration

### Environment Variables
```env
# .env
VITE_API_URL=http://localhost:8080/api
VITE_ENV=development
```

### API Base URL
```
http://localhost:8080/api/v1/auth
```

## Authenticated Endpoints Ready

### 1. **Register (Sign Up)**
- **Endpoint**: `POST /api/v1/auth/register`
- **Required**: `name`, `email`, `password`
- **Returns**: JWT token + user data

### 2. **Login**
- **Endpoint**: `POST /api/v1/auth/login`
- **Required**: `email`, `password`
- **Returns**: JWT token + user data

### 3. **Verify Token**
- **Endpoint**: `GET /api/v1/auth/verify`
- **Headers**: `Authorization: Bearer <token>`

### 4. **Refresh Token**
- **Endpoint**: `POST /api/v1/auth/refresh`
- **Headers**: `Authorization: Bearer <token>`

## Quick Start

### 1. Start Backend
```bash
cd /path/to/backend
go run ./cmd/server
# Backend running at http://localhost:8080
```

### 2. Start Frontend
```bash
cd /path/to/frontend/vestis
pnpm dev
# Frontend running at http://localhost:5173
```

### 3. Test Login Flow
1. Open http://localhost:5173/login
2. Enter credentials:
   - Email: `kelvin@gmail.com`
   - Password: `Lionleon30`
3. Click "Login"
4. Token is automatically stored in localStorage

### 4. Test Signup Flow
1. Open http://localhost:5173/signup
2. Fill in form with:
   - Name: Your name
   - Email: your@email.com
   - Password: your password
3. Click "Sign Up"
4. Account created and logged in automatically

## Data Flow

```
Frontend UI
    ↓
React Component (Login.tsx / Signup.tsx)
    ↓
Zustand Store (authStore.ts)
    ↓
Auth Service (authService.ts)
    ↓
HTTP Request to Backend
    ↓
Backend API
    ↓
Response: JWT Token + User Data
    ↓
localStorage Storage
    ↓
Protected Routes Access
```

## File Structure

```
vestis/
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── .env.production               # Production config
├── vite.config.ts               # Vite config with proxy
├── src/
│   ├── services/
│   │   └── authService.ts       # API calls (updated)
│   ├── components/
│   │   ├── Login.tsx            # Login form
│   │   └── Signup.tsx           # Signup form
│   ├── contexts/
│   │   └── authStore.ts         # Zustand auth store
│   ├── types/
│   │   └── auth.ts              # TypeScript types
│   └── providers/
│       └── AuthProvider.tsx     # Auth context provider
├── API_INTEGRATION.md           # Full API documentation
├── LOGIN_API.md                 # Login API reference
└── test-auth-api.sh             # API testing script
```

## Key Features Configured

✅ **JWT Authentication**
- Tokens stored in localStorage
- Automatic token management
- Token refresh capability

✅ **Protected Routes**
- ProtectedRoute component checks authentication
- Redirects unauthorized users to login

✅ **Error Handling**
- User-friendly error messages
- Automatic error clearing
- Loading states during requests

✅ **CORS Handling**
- Vite proxy configured for development
- `X-Requested-With` header included
- Cross-origin requests work seamlessly

✅ **State Management**
- Zustand store for auth state
- Global access to user data
- Easy logout functionality

## Testing Checklist

- [ ] Backend running on `http://localhost:8080`
- [ ] Frontend running on `http://localhost:5173`
- [ ] Can register new account
- [ ] Can login with existing account
- [ ] Token appears in localStorage
- [ ] Can access protected routes
- [ ] Logout clears token
- [ ] Token refresh works

## Troubleshooting

### "Cannot connect to http://localhost:8080"
**Solution**: Start your backend server
```bash
go run ./cmd/server
```

### "Login/Signup returns 404"
**Solution**: Check API endpoints match your backend:
- Expected: `/api/v1/auth/login` and `/api/v1/auth/register`
- Verify in `authService.ts`

### "CORS error in browser console"
**Solution**: The Vite proxy should handle this. Check:
- `vite.config.ts` has proxy configuration
- Backend is running on port 8080

### "Token not stored in localStorage"
**Solution**: Check browser DevTools:
1. Open F12 → Application
2. Check Local Storage for `auth_token`
3. Verify response is valid JSON

## Documentation Files

1. **API_INTEGRATION.md** - Complete API documentation
2. **LOGIN_API.md** - Login endpoint reference
3. **test-auth-api.sh** - Bash script for API testing

## Next Steps

1. **Test Authentication Flows**
   - Use provided cURL commands
   - Test through UI
   - Verify token storage

2. **Implement Protected Routes**
   - Use `ProtectedRoute` component
   - Add authorization checks
   - Handle token expiry

3. **Add Additional Features**
   - Password reset
   - Email verification
   - OAuth integration

4. **Production Deployment**
   - Update `.env.production`
   - Configure CORS for production domain
   - Implement secure token storage

## Support

For issues or questions:
1. Check documentation files
2. Review browser console for errors
3. Check backend logs
4. Verify API endpoints match your backend spec

---

**Status**: ✅ Ready for Authentication Testing
**Last Updated**: October 26, 2025
