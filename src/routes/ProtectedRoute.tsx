// ProtectedRoute is no longer needed in Next.js
// Protection is handled by the dashboard layout component
// and middleware in src/middleware.ts

// Re-export for backwards compatibility if referenced anywhere
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
