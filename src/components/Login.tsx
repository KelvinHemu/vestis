import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../contexts/authStore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardTitle } from './ui/card';
import { MainContent } from './MainContent';

interface LoginProps {
  onSuccess?: () => void;
}

export function Login({ onSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);

    try {
      await login({ email, password });
      onSuccess?.();
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by zustand store
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainContent showBackButton={false}>
      <div className="flex items-start justify-center mt-8">
        <Card className="w-full max-w-md bg-white border-gray-200">
          <div className="flex items-start justify-between p-6">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Login to your account</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Enter your email below to login to your account
              </CardDescription>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pb-6">
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  required
                  disabled={isSubmitting}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-900">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-10"
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-600">Or continue with</span>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline"
                onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/v1/auth/google`}
                className="w-full border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
              >
                <img src="/images/icons/google.png" alt="Google" className="w-4 h-4 mr-2" />
                Login with Google
              </Button>
            </CardContent>
          </form>

          <div className="px-6 pb-6 text-center text-sm text-gray-600 space-y-3">
            <p>
              <Link to="/forgot-password" className="text-gray-900 font-semibold hover:text-blue-600">
                Forgot password?
              </Link>
            </p>
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="text-gray-900 font-semibold hover:text-blue-600">
                Sign Up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </MainContent>
  );
}
