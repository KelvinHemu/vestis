# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

# Vestis Frontend - React + TypeScript + Vite

A modern frontend application with integrated authentication and protected routes.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- pnpm (or npm/yarn)
- Backend running at `http://localhost:8080`

### Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Configure environment**
   ```bash
   # Copy the example
   cp .env.example .env
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```
   Frontend runs at: `http://localhost:5173`

## 🔐 Authentication

### Quick Login

The system includes a complete authentication flow:

**Test Credentials:**
- Email: `kelvin@gmail.com`
- Password: `Lionleon30`

### Features

- ✅ User registration (sign up)
- ✅ User login with JWT
- ✅ Protected routes
- ✅ Automatic token management
- ✅ Persistent sessions
- ✅ Error handling

### API Integration

Backend must be running at:
```
http://localhost:8080/api
```

**Endpoints:**
- `POST /api/v1/auth/register` - Sign up
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/verify` - Verify token
- `POST /api/v1/auth/refresh` - Refresh token

For more details, see [API_INTEGRATION.md](./API_INTEGRATION.md)

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Login.tsx       # Login form
│   ├── Signup.tsx      # Signup form
│   └── ui/             # UI components
├── contexts/           # Zustand stores
│   └── authStore.ts    # Auth state management
├── services/           # API services
│   └── authService.ts  # Authentication API
├── types/              # TypeScript types
│   └── auth.ts         # Auth interfaces
├── routes/             # Routing
│   └── ProtectedRoute.tsx
└── App.tsx             # Main app
```

## 🔧 Configuration

### Environment Variables

**.env (development)**
```env
VITE_API_URL=http://localhost:8080/api
VITE_ENV=development
```

**.env.production**
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_ENV=production
```

## 🧪 Testing

### Login via Browser
1. Go to `http://localhost:5173/login`
2. Enter credentials
3. Click "Login"

### Login via cURL
```bash
curl -X POST 'http://localhost:8080/api/v1/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"kelvin@gmail.com","password":"Lionleon30"}'
```

### Check Stored Token
```javascript
// In browser console
localStorage.getItem('auth_token')
JSON.parse(localStorage.getItem('auth_user'))
```

## 📦 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm preview` - Preview production build

## 📚 Documentation

- [API_INTEGRATION.md](./API_INTEGRATION.md) - Full API documentation
- [LOGIN_API.md](./LOGIN_API.md) - Login endpoint reference
- [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) - Backend setup guide
- [STATUS_REPORT.md](./STATUS_REPORT.md) - Integration status
- [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) - Verification checklist

## 🛠 Tech Stack

- **React** 19.1.1
- **TypeScript** 5.9.3
- **Vite** (Rolldown)
- **Tailwind CSS** 4.1.16
- **Zustand** 5.0.8 (State management)
- **React Hook Form** 7.65.0
- **Zod** 4.1.12 (Validation)

## 🔐 Security Features

- JWT token authentication
- Protected routes with middleware
- Secure token storage
- Automatic token refresh
- CORS handling via Vite proxy

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend unreachable | Start backend: `go run ./cmd/server` |
| Login fails | Check credentials and backend URL |
| CORS error | Ensure Vite proxy is configured (automatic) |
| Token not stored | Check browser DevTools → Local Storage |

## 📞 Support

For issues:
1. Check [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)
2. Review browser console for errors
3. Check backend logs
4. Verify API endpoints match specification

## 📝 License

This project is part of the Vestis application.

---

**Last Updated**: October 26, 2025  
**Status**: ✅ Production Ready

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
