import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login, Signup, OAuthCallback, Sidebar, OnModelPhotos, FlatLayPhotos, MannequinPhotos, BackgroundChange, CreatePage, GenerationHistory } from './components';
import { AuthProvider } from './providers';
import { ProtectedRoute } from './routes';
import { useAuthStore } from './contexts/authStore';
import './utils/authDebug'; // Import auth debugging utilities

// Layout wrapper for authenticated pages
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 ml-16">
        <main className="min-h-screen bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}

// Simple layout for public pages (login/signup) - no sidebar
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <main className="min-h-screen w-full bg-white">
        {children}
      </main>
    </div>
  );
}

// Example Dashboard component (protected)
function Dashboard() {
  const { loginWithOAuth, isAuthenticated } = useAuthStore();
  const [isProcessingAuth, setIsProcessingAuth] = React.useState(false);

  // Handle OAuth tokens in URL hash on component mount
  React.useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash && !isAuthenticated && !isProcessingAuth) {
      setIsProcessingAuth(true);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken) {
        console.log('Processing OAuth tokens from URL hash...');

        // Store tokens
        localStorage.setItem('auth_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }

        // Decode JWT to get user info
        try {
          const base64Url = accessToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));

          const payload = JSON.parse(jsonPayload);
          const user = { id: payload.user_id, email: payload.email };

          localStorage.setItem('auth_user', JSON.stringify(user));
          loginWithOAuth(accessToken, user);

          // Clean URL
          window.history.replaceState(null, '', '/dashboard');
        } catch (error) {
          console.error('Failed to decode token:', error);
        }
      }
      setIsProcessingAuth(false);
    }
  }, [loginWithOAuth, isAuthenticated, isProcessingAuth]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Empty homepage for now */}
      </div>
    </div>
  );
}

function App() {
  const { isInitialized, isLoading } = useAuthStore();

  // Show loading screen while initializing auth
  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-900 border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes - with sidebar/topbar */}
      <Route path="/login" element={<PublicLayout><Login onSuccess={() => { }} /></PublicLayout>} />
      <Route path="/signup" element={<PublicLayout><Signup onSuccess={() => { }} /></PublicLayout>} />

      {/* OAuth callback route - no layout needed */}
      <Route path="/auth/callback" element={<OAuthCallback />} />

      {/* Protected routes - with sidebar/topbar */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CreatePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/on-model-photos"
        element={
          <ProtectedRoute>
            <AppLayout>
              <OnModelPhotos />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/flat-lay-photos"
        element={
          <ProtectedRoute>
            <AppLayout>
              <FlatLayPhotos />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mannequin-photos"
        element={
          <ProtectedRoute>
            <AppLayout>
              <MannequinPhotos />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/background-change"
        element={
          <ProtectedRoute>
            <AppLayout>
              <BackgroundChange />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Placeholder routes for sidebar items */}
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <AppLayout>
              <GenerationHistory />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/assets" element={<ProtectedRoute><AppLayout><div className="p-8 text-gray-900">Assets Page</div></AppLayout></ProtectedRoute>} />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <AppLayout>
              <GenerationHistory />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/profile" element={<ProtectedRoute><AppLayout><div className="p-8 text-gray-900">Profile Page</div></AppLayout></ProtectedRoute>} />
      <Route path="/story" element={<ProtectedRoute><AppLayout><div className="p-8 text-gray-900">Story Page (Beta)</div></AppLayout></ProtectedRoute>} />
      <Route path="/video" element={<ProtectedRoute><AppLayout><div className="p-8 text-gray-900">Video Page</div></AppLayout></ProtectedRoute>} />
      <Route path="/image" element={<ProtectedRoute><AppLayout><div className="p-8 text-gray-900">Image Page</div></AppLayout></ProtectedRoute>} />
      <Route path="/character" element={<ProtectedRoute><AppLayout><div className="p-8 text-gray-900">Character Page</div></AppLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppLayout><div className="p-8 text-gray-900">Settings Page</div></AppLayout></ProtectedRoute>} />
      <Route path="/help" element={<ProtectedRoute><AppLayout><div className="p-8 text-gray-900">Help Page</div></AppLayout></ProtectedRoute>} />
      <Route path="/more" element={<ProtectedRoute><AppLayout><div className="p-8 text-gray-900">More Page</div></AppLayout></ProtectedRoute>} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function AppWithRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppWithRouter
