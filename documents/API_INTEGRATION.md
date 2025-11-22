# Backend API Integration

## API Configuration

The frontend is configured to communicate with the backend running at `http://localhost:8080`.

### Environment Variables

The API URL is configured via the `.env` file:

```env
VITE_API_URL=http://localhost:8080/api
```

### API Endpoints

#### Authentication

**Register/Sign Up**
- **Endpoint**: `POST /api/v1/auth/register`
- **Headers**:
  - `Content-Type: application/json`
  - `Accept: application/json`
  - `X-Requested-With: XMLHttpRequest`
- **Request Body**:
  ```json
  {
    "name": "test",
    "email": "test@gmail.com",
    "password": "test12378"
  }
  ```
- **Response**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 2,
      "name": "test",
      "email": "test@gmail.com",
      "created_at": "2025-10-26T08:41:45.7957774+03:00",
      "updated_at": "2025-10-26T08:41:45.7957774+03:00"
    }
  }
  ```

**Login**
- **Endpoint**: `POST /api/v1/auth/login`
- **Headers**:
  - `Content-Type: application/json`
  - `Accept: application/json`
  - `X-Requested-With: XMLHttpRequest`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "kelvin",
      "email": "kelvin@gmail.com",
      "created_at": "2025-10-26T05:14:12.667671+03:00",
      "updated_at": "2025-10-26T05:14:12.667671+03:00"
    }
  }
  ```
- **Example cURL**:
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

**Verify Token**
- **Endpoint**: `GET /api/v1/auth/verify`
- **Headers**:
  - `Authorization: Bearer <token>`

**Refresh Token**
- **Endpoint**: `POST /api/v1/auth/refresh`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`

## Testing the Integration

### Using cURL

Register a new user:
```bash
curl -X 'POST' \
  'http://localhost:8080/api/v1/auth/register' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-Requested-With: XMLHttpRequest' \
  -d '{
  "name": "test",
  "email": "test@gmail.com",
  "password": "test12378"
}'
```

Login with credentials:
```bash
curl -X 'POST' \
  'http://localhost:8080/api/v1/auth/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-Requested-With: XMLHttpRequest' \
  -d '{
  "email": "test@gmail.com",
  "password": "test12378"
}'
```

Login with existing user:
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

### Using the Frontend

#### Sign Up Flow
1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Navigate to the signup page at `http://localhost:5173/signup`

3. Fill in the form with:
   - Name: test
   - Email: test@gmail.com
   - Password: test12378
   - Confirm Password: test12378

4. Click "Sign Up"

The frontend will automatically:
- Send request to `http://localhost:8080/api/v1/auth/register`
- Store JWT token in `localStorage` under key `auth_token`
- Store user data in `localStorage` under key `auth_user`
- Redirect to dashboard or protected route

#### Login Flow
1. Navigate to the login page at `http://localhost:5173/login`

2. Fill in the form with:
   - Email: kelvin@gmail.com
   - Password: Lionleon30

3. Click "Login"

The frontend will:
- Send request to `http://localhost:8080/api/v1/auth/login`
- Receive JWT token and user data
- Store both in localStorage
- Automatically redirect to protected routes

#### Verify Authentication
After login/signup, check browser DevTools:

1. Open DevTools (F12)
2. Go to Application → Local Storage → http://localhost:5173
3. You should see:
   - `auth_token`: Your JWT token
   - `auth_user`: Your user JSON data

## Authentication Flow

1. **Sign Up/Login**: User submits credentials
2. **Token Storage**: JWT token is stored in `localStorage` under key `auth_token`
3. **User Storage**: User data is stored in `localStorage` under key `auth_user`
4. **Protected Routes**: Routes check for valid token before allowing access
5. **Token Refresh**: Token can be refreshed before expiration
6. **Token Verification**: Token validity is checked on app initialization

## CORS Configuration

The Vite dev server is configured with a proxy for `/api` requests:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '/api'),
    },
  },
}
```

This helps avoid CORS issues during development.

## Backend Requirements

Make sure your backend server is running at `http://localhost:8080` and has the following endpoints:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/verify`
- `POST /api/v1/auth/refresh`

The backend should return responses in the format specified above.
