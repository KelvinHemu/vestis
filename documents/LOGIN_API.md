# Login API - Quick Reference

## Endpoint
```
POST http://localhost:8080/api/v1/auth/login
```

## Request Format

### Headers
```
Content-Type: application/json
Accept: application/json
X-Requested-With: XMLHttpRequest
```

### Body
```json
{
  "email": "kelvin@gmail.com",
  "password": "Lionleon30"
}
```

## Response Format

### Success (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6ImtlbHZpbkBnbWFpbC5jb20iLCJleHAiOjE3NjE1NDQwMDAsIm5iZiI6MTc2MTQ1NzYwMCwiaWF0IjoxNzYxNDU3NjAwfQ.3YrbiNoUIplnpJjY3dBYG0UQf9lb2YpFE6JyRRs8BA8",
  "user": {
    "id": 1,
    "name": "kelvin",
    "email": "kelvin@gmail.com",
    "created_at": "2025-10-26T05:14:12.667671+03:00",
    "updated_at": "2025-10-26T05:14:12.667671+03:00"
  }
}
```

## Testing Commands

### cURL
```bash
curl -X 'POST' \
  'http://localhost:8080/api/v1/auth/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-Requested-With: XMLHttpRequest' \
  -d '{
  "email": "kelvin@gmail.com",
  "password": "Lionleon30"
}'
```

### Using HTTPie
```bash
http POST http://localhost:8080/api/v1/auth/login \
  email="kelvin@gmail.com" \
  password="Lionleon30" \
  Accept:application/json \
  X-Requested-With:XMLHttpRequest
```

### Using JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:8080/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  body: JSON.stringify({
    email: 'kelvin@gmail.com',
    password: 'Lionleon30'
  })
});

const data = await response.json();
console.log(data);
```

## Frontend Implementation

The login is already integrated in the `Login.tsx` component. To use it:

1. **Navigate to Login Page**
   ```
   http://localhost:5173/login
   ```

2. **Enter Credentials**
   - Email: kelvin@gmail.com
   - Password: Lionleon30

3. **Click Login Button**
   - The form is automatically validated
   - Request is sent to backend
   - Response is handled and stored in Zustand store

4. **Token Storage**
   - JWT token is stored in `localStorage` as `auth_token`
   - User data is stored in `localStorage` as `auth_user`

## Response Fields Explained

| Field | Type | Description |
|-------|------|-------------|
| `token` | string | JWT token for authentication (expires in ~24 hours) |
| `user.id` | number | User's unique identifier |
| `user.name` | string | User's display name |
| `user.email` | string | User's email address |
| `user.created_at` | string | Account creation timestamp (ISO 8601) |
| `user.updated_at` | string | Last profile update timestamp (ISO 8601) |

## Token Usage

After login, include the token in subsequent requests:

```bash
curl -X GET 'http://localhost:8080/api/protected-endpoint' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

## Error Handling

### Invalid Credentials (401)
```json
{
  "message": "Invalid email or password"
}
```

### Missing Fields (400)
```json
{
  "message": "Email and password are required"
}
```

### Backend Error (500)
```json
{
  "message": "Internal server error"
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Connection refused** | Ensure backend is running: `go run ./cmd/server` |
| **CORS error** | Vite proxy is configured in `vite.config.ts` |
| **Invalid token** | Token might be expired, refresh or login again |
| **401 Unauthorized** | Token not included in header or invalid |

## Files Modified

- `src/services/authService.ts` - API calls
- `src/components/Login.tsx` - UI component
- `src/contexts/authStore.ts` - State management
- `src/types/auth.ts` - TypeScript types
- `.env` - Environment configuration
- `vite.config.ts` - Development proxy

## Environment Variables

```env
# .env
VITE_API_URL=http://localhost:8080/api
VITE_ENV=development
```

The API URL can be changed in `.env` for different environments (development, staging, production).
