# Authentication System Implementation

A complete, production-ready authentication system for your React + TypeScript application using Zustand for state management.

## 📋 What's Included

### 1. **Type Definitions** (`src/types/auth.ts`)
- `User` - User data interface
- `AuthState` - Auth state structure
- `LoginCredentials` & `SignupCredentials` - Form input types
- `AuthResponse` - API response format

### 2. **Auth Service** (`src/services/authService.ts`)
RESTful API client for authentication operations:
- `login()` - Authenticate user with email/password
- `signup()` - Register new user
- `logout()` - Clear authentication data
- `getToken()` - Retrieve stored JWT token
- `getUser()` - Get current user data
- `isAuthenticated()` - Check auth status
- `refreshToken()` - Refresh expired token
- `verifyToken()` - Validate token with backend

**Token Storage**: Uses `localStorage` with keys:
- `auth_token` - JWT token
- `auth_user` - User object

**API Configuration**: Set `VITE_API_URL` environment variable

### 3. **Zustand Store** (`src/contexts/authStore.ts`)
Global state management for authentication:
```tsx
import { useAuthStore } from './contexts/authStore';

// In any component
const { 
  user, 
  token, 
  isLoading, 
  error, 
  isAuthenticated,
  login,
  signup,
  logout,
  clearError,
  initializeAuth
} = useAuthStore();
```

### 4. **Components**

#### **AuthProvider** (`src/components/AuthProvider.tsx`)
Wraps your app and initializes auth on load:
```tsx
// In main.tsx or App.tsx
<AuthProvider>
  <App />
</AuthProvider>
```

#### **Login** (`src/components/Login.tsx`)
Pre-built login form component:
- Email & password inputs
- Error message display
- Loading state
- Links to signup and forgot password

#### **Signup** (`src/components/Signup.tsx`)
User registration form component:
- Name, email, password inputs
- Password confirmation
- Error handling
- Link back to login

#### **ProtectedRoute** (`src/components/ProtectedRoute.tsx`)
Wraps components requiring authentication:
```tsx
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>
```

Features:
- Automatic redirect to login if not authenticated
- Loading state display
- Role-based access control
- Access denied message for insufficient permissions

#### **Navbar** (`src/components/Navbar.tsx`)
Navigation bar with auth state:
- Displays user name when authenticated
- Shows login/signup links when not authenticated
- Logout button
- Responsive design

## 🚀 Quick Start

### 1. **Setup Environment Variables**
Create `.env` file in project root:
```env
VITE_API_URL=http://localhost:3000/api
```

### 2. **Update main.tsx**
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './components'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
```

### 3. **Update App.tsx** (Already done with example)
```tsx
import { AuthProvider, Login, Signup, Navbar, ProtectedRoute } from './components';
import { useAuthStore } from './contexts/authStore';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <AppRouter />
    </AuthProvider>
  );
}
```

### 4. **Use in Components**
```tsx
import { useAuthStore } from './contexts/authStore';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuthStore();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 🔒 Backend API Requirements

Your backend should implement these endpoints:

### POST `/api/auth/login`
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST `/api/auth/signup`
```json
Request:
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}

Response: (Same as login)
```

### POST `/api/auth/refresh`
```json
Request Header:
Authorization: Bearer <token>

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### GET `/api/auth/verify`
```json
Request Header:
Authorization: Bearer <token>

Response: 200 OK (if valid)
Response: 401 Unauthorized (if invalid)
```

## 🎨 Styling

All components include pre-built CSS:
- `Login.css` - Login form styling
- `Signup.css` - Signup form styling
- `Navbar.css` - Navigation bar styling
- Custom gradient colors (purple theme)
- Responsive mobile design
- Hover effects and transitions

Customize colors by editing the gradient:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## 🔄 Authentication Flow

1. **Initialization**: `AuthProvider` initializes auth on app load
2. **Login/Signup**: User enters credentials → API call → Token stored
3. **Protected Routes**: Check `isAuthenticated` → Show content or redirect
4. **Token Refresh**: Auto-refresh on API calls (if implemented)
5. **Logout**: Clear token and user data → Redirect to login

## 🛠️ Advanced Usage

### Manual Token Management
```tsx
import authService from './services/authService';

// Get current token
const token = authService.getToken();

// Check auth status
if (authService.isAuthenticated()) {
  console.log('User is authenticated');
}

// Refresh token
try {
  const newToken = await authService.refreshToken();
} catch (error) {
  console.error('Token refresh failed');
}
```

### API Interceptor (Optional)
To automatically add token to all API requests:

```tsx
// In a hook or utility
async function apiCall(url: string, options: RequestInit = {}) {
  const token = authService.getToken();
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  return fetch(url, { ...options, headers });
}
```

### Role-Based Access
```tsx
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>

<ProtectedRoute requiredRole="moderator">
  <ModerationPanel />
</ProtectedRoute>
```

### Error Handling
```tsx
function LoginForm() {
  const { login, error, clearError } = useAuthStore();

  useEffect(() => {
    return () => clearError(); // Clean up on unmount
  }, [clearError]);

  const handleLogin = async () => {
    try {
      await login(credentials);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };
}
```

## 📦 File Structure
```
src/
├── components/
│   ├── AuthProvider.tsx      # Initialize auth
│   ├── Login.tsx              # Login form
│   ├── Signup.tsx             # Signup form
│   ├── ProtectedRoute.tsx      # Route protection
│   ├── Navbar.tsx             # Navigation
│   └── index.ts               # Barrel export
├── contexts/
│   └── authStore.ts           # Zustand store
├── services/
│   └── authService.ts         # API client
├── types/
│   └── auth.ts                # Type definitions
└── App.tsx                    # Main app component
```

## 🐛 Troubleshooting

### Token not persisting
- Check if localStorage is enabled
- Verify `VITE_API_URL` is correct
- Check browser DevTools > Application > Local Storage

### Protected route showing login
- Ensure `AuthProvider` wraps your app
- Check `initializeAuth()` completes successfully
- Verify token is valid

### API calls failing
- Verify backend is running
- Check `VITE_API_URL` environment variable
- Ensure CORS is configured on backend
- Check Network tab in DevTools

## 🔐 Security Best Practices

✅ **Implemented:**
- JWT token in localStorage (consider moving to HTTPOnly cookie)
- Token validation on initialization
- Automatic logout on invalid token

⚠️ **Recommended Additions:**
- Use HTTPOnly cookies instead of localStorage for tokens
- Implement CSRF protection
- Add password strength validation
- Implement rate limiting for login attempts
- Add "Remember me" functionality
- Implement multi-factor authentication

## 📝 Next Steps

1. Configure your backend API endpoints
2. Set `VITE_API_URL` environment variable
3. Test login/signup flows
4. Customize styling to match your brand
5. Add additional auth features (forgot password, email verification, etc.)
6. Implement error boundaries
7. Add analytics/logging

## 📞 Support

For issues or questions:
- Check browser console for error messages
- Verify backend API is responding correctly
- Check Network tab in DevTools for API calls
- Review component props and usage

Happy coding! 🎉
