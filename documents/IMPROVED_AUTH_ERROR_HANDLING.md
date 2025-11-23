# Improved Authentication Error Handling

## Overview

The authentication system has been refactored to provide better error handling with user-friendly messages and a cleaner architecture using hooks and utilities.

## Architecture

### Directory Structure

```
src/
├── hooks/
│   ├── useAuth.ts          # Authentication hooks
│   └── index.ts            # Exports
├── utils/
│   └── errorHandler.ts     # Error parsing and handling
├── types/
│   ├── errors.ts           # Error types and classes
│   └── auth.ts             # Auth types
├── services/
│   └── authService.ts      # API calls
├── components/
│   └── ui/
│       └── ErrorMessage.tsx # Reusable error display
└── contexts/
    └── authStore.ts        # Zustand store
```

## Features

### 1. **Error Types** (`src/types/errors.ts`)

Defines all possible authentication error codes:

- `INVALID_CREDENTIALS` - Wrong email/password
- `USER_EXISTS` - Email already registered
- `INVALID_EMAIL` - Invalid email format
- `WEAK_PASSWORD` - Password doesn't meet requirements
- `NETWORK_ERROR` - Connection issues
- `SERVER_ERROR` - Backend errors
- `TOKEN_EXPIRED` - Session expired
- `INVALID_TOKEN` - Invalid auth token
- `UNAUTHORIZED` - Not authorized
- `UNKNOWN_ERROR` - Unexpected errors

### 2. **Error Handler** (`src/utils/errorHandler.ts`)

Intelligent error parsing that converts API errors to user-friendly messages:

```typescript
import { parseAuthError } from '../utils/errorHandler';

try {
  // ... API call
} catch (error) {
  const authError = parseAuthError(error);
  console.log(authError.message); // User-friendly message
}
```

**Error Message Mapping:**

| API Response | User Message |
|--------------|--------------|
| `"invalid authentication credentials"` | "The email or password you entered is incorrect. Please try again." |
| `"user already exists"` | "An account with this email already exists. Please login instead." |
| `"invalid email"` | "Please enter a valid email address." |
| `"password is too weak"` | "Password must be at least 8 characters long and include letters and numbers." |
| Network failure | "Unable to connect to the server. Please check your internet connection." |

### 3. **Authentication Hooks** (`src/hooks/useAuth.ts`)

Clean, reusable hooks for authentication:

#### `useLogin(onSuccess?)`

```typescript
const { login, isLoading, error, clearError } = useLogin(() => {
  console.log('Login successful!');
});

await login({ email, password });
```

#### `useSignup(onSuccess?)`

```typescript
const { signup, isLoading, error, clearError } = useSignup(() => {
  console.log('Signup successful!');
});

await signup({ name, email, password });
```

#### `useLogout()`

```typescript
const { logout, isLoading } = useLogout();

logout(); // Clears auth and redirects to login
```

### 4. **Error Message Component** (`src/components/ui/ErrorMessage.tsx`)

Reusable error display component with icons and dismiss functionality:

```tsx
<ErrorMessage
  message="Invalid credentials"
  type="error"  // error | success | warning | info
  onDismiss={clearError}
/>
```

## Usage Examples

### Login Component

```tsx
import { useLogin } from '../hooks/useAuth';
import { ErrorMessage } from './ui/ErrorMessage';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
    } catch (err) {
      // Error already handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} onDismiss={clearError} />}
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      <button disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Signup Component

```tsx
import { useSignup } from '../hooks/useAuth';
import { ErrorMessage } from './ui/ErrorMessage';

export function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { signup, isLoading, error, clearError } = useSignup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(formData);
    } catch (err) {
      // Error already handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} onDismiss={clearError} />}
      {/* Form fields */}
      <button disabled={isLoading}>Sign Up</button>
    </form>
  );
}
```

## API Error Format

The backend should return errors in this format:

### Standard Error Response

```json
{
  "error": "invalid authentication credentials"
}
```

or

```json
{
  "message": "User already exists"
}
```

### Supported Error Messages

The error handler will recognize and convert these messages:

**Authentication:**
- `"invalid authentication credentials"`
- `"invalid credentials"`
- `"incorrect password"`
- `"wrong password"`

**User Management:**
- `"user already exists"`
- `"email already registered"`
- `"email is already in use"`

**Validation:**
- `"invalid email"`
- `"email is not valid"`
- `"password is too weak"`
- `"password must be"`

**Session:**
- `"token expired"`
- `"session expired"`
- `"invalid token"`
- `"unauthorized"`

## Benefits

1. **Separation of Concerns**
   - Hooks handle state and logic
   - Services handle API calls
   - Utils handle error parsing
   - Components handle UI

2. **Reusability**
   - Hooks can be used in any component
   - Error handler works with any API error
   - ErrorMessage component is generic

3. **User Experience**
   - Clear, actionable error messages
   - Visual feedback with icons
   - Dismissable errors
   - Loading states

4. **Developer Experience**
   - Type-safe error handling
   - Easy to test
   - Easy to extend
   - Consistent patterns

## Testing

### Test Error Handling

```typescript
import { parseAuthError, getErrorMessage } from '../utils/errorHandler';
import { AuthErrorCode } from '../types/errors';

// Test invalid credentials
const error1 = new Error('invalid authentication credentials');
const parsed1 = parseAuthError(error1);
console.assert(parsed1.code === AuthErrorCode.INVALID_CREDENTIALS);

// Test network error
const error2 = new TypeError('Failed to fetch');
const parsed2 = parseAuthError(error2);
console.assert(parsed2.code === AuthErrorCode.NETWORK_ERROR);
```

## Future Enhancements

1. **Field-Specific Errors**
   - Highlight specific form fields with errors
   - Use the `field` property from `AuthError`

2. **Error Recovery**
   - Suggest actions (e.g., "Forgot password?" link)
   - Retry mechanisms for network errors

3. **Analytics**
   - Track error occurrences
   - Monitor authentication issues

4. **Internationalization**
   - Support multiple languages
   - Context-aware messages

## Migration Guide

### Before (Old Code)

```tsx
const { login, error } = useAuthStore();

try {
  await login(credentials);
} catch (err) {
  // Generic error handling
}
```

### After (New Code)

```tsx
const { login, error, clearError } = useLogin();

try {
  await login(credentials);
} catch (err) {
  // Detailed, user-friendly errors
}
```

The new system automatically provides better error messages without additional code changes!
