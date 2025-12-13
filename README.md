# Vestis - AI Fashion Photography Platform

A modern Next.js 15 application for AI-powered fashion photography generation.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm/yarn
- Backend API running at `http://localhost:8080`

### setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Configure environment**
   ```bash
   # Create .env.local file
   echo "NEXT_PUBLIC_API_URL=http://localhost:8080/api" > .env.local
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```
   
   Frontend runs at: `http://localhost:3000`

## 🔐 Authentication

The system includes a complete authentication flow:

- ✅ Google OAuth login
- ✅ Email/password login
- ✅ JWT token management
- ✅ Protected routes with middleware
- ✅ Automatic token refresh
- ✅ Persistent sessions via Zustand

### API Endpoints

Backend must be running at: `http://localhost:8080/api`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/auth/login` | POST | Email/password login |
| `/v1/auth/register` | POST | User registration |
| `/v1/auth/google` | GET | Google OAuth initiation |
| `/v1/auth/refresh` | POST | Token refresh |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── auth/callback/     # OAuth callback handler
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── Login.tsx         # Login form
│   ├── Signup.tsx        # Signup form
│   ├── Sidebar.tsx       # Navigation sidebar
│   └── ...               # Feature components
├── contexts/             # Zustand stores
│   ├── authStore.ts      # Auth state management
│   └── ...               # Feature stores
├── hooks/                # Custom React hooks
├── lib/                  # Utilities
│   ├── queryClient.ts    # React Query config
│   └── utils.ts          # Helper functions
├── providers/            # Context providers
├── services/             # API service classes
├── types/                # TypeScript types
└── middleware.ts         # Next.js middleware
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` in the project root:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

For production:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.3.4 | React framework with App Router |
| React | 19.1.1 | UI library |
| TypeScript | 5.9.3 | Type safety |
| Tailwind CSS | 4.1.16 | Styling |
| Zustand | 5.0.8 | State management |
| TanStack Query | 5.90.11 | Data fetching & caching |
| React Hook Form | 7.65.0 | Form handling |
| Zod | 4.1.12 | Schema validation |
| Radix UI | Various | Accessible primitives |

## 🔒 Security Features

- JWT token authentication
- Protected routes via middleware + layout guards
- Secure token storage in localStorage
- Automatic token refresh on expiry
- CORS handling via Next.js rewrites

## 🎨 Features

- **On-Model Photos**: Generate photos with AI models
- **Flat Lay Photos**: Transform flat-lay images to on-model
- **Mannequin Photos**: Convert mannequin shots to model photos
- **Background Change**: AI-powered background replacement
- **Model Management**: Browse and select from AI model library
- **Payment System**: Credits-based payment system
- **Generation History**: View and manage past generations

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend unreachable | Ensure backend is running at configured URL |
| CORS errors | Check `next.config.ts` rewrites configuration |
| Auth issues | Clear localStorage and try logging in again |
| Build errors | Delete `.next` folder and rebuild |

## 📚 Documentation

- [API Integration Guide](./documents/API_INTEGRATION.md)
- [Authentication Guide](./documents/AUTHENTICATION.md)
- [Backend Integration](./documents/BACKEND_INTEGRATION.md)

## 📝 License

This project is part of the Vestis application.

---

**Framework**: Next.js 15 with App Router  
**Status**: ✅ Production Ready
