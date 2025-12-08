import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* ============================================
   Next.js Proxy (formerly Middleware)
   Handles authentication redirects at the edge
   
   Note: Since we're using client-side auth with
   Zustand/localStorage, the actual auth check
   happens in the dashboard layout. This proxy
   provides basic route protection patterns.
   ============================================ */

// Routes that require authentication
// const protectedRoutes = [
//   "/dashboard",
//   "/create",
//   "/models",
//   "/projects",
//   "/payment",
//   "/profile",
//   "/on-model-photos",
//   "/flat-lay-photos",
//   "/mannequin-photos",
//   "/background-change",
//   "/register-model",
//   "/history",
//   "/assets",
// ];

// Routes that should redirect to dashboard if authenticated
const authRoutes = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get auth token from cookies (if using cookie-based auth)
  // For localStorage-based auth, the check happens client-side
  const authToken = request.cookies.get("auth_token")?.value;

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname === route);

  // If we have cookie-based auth token and user tries to access auth pages,
  // redirect to dashboard
  if (authToken && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // For protected routes without cookie token, let the client-side
  // auth check handle the redirect (since we use localStorage)
  // The dashboard layout will handle the actual auth check

  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.jpeg$|.*\\.webp$).*)",
  ],
};


