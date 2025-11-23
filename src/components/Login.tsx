import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { useLogin } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardTitle } from './ui/card';
import { ErrorMessage } from './ui/ErrorMessage';
import { MainContent } from './MainContent';

interface LoginProps {
  onSuccess?: () => void;
}

export function Login({ onSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error, clearError } = useLogin(onSuccess);

  console.log('Login component render - error state:', error, 'isLoading:', isLoading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    await login({ email, password });
  };

  const handleClearError = () => {
    console.log('Manually clearing error');
    clearError();
  };

  return (
    <MainContent showBackButton={false}>
      <div className="min-h-screen bg-white flex items-center justify-center py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6">
        <Card className="w-full max-w-[95%] sm:max-w-md bg-white border-gray-200 shadow-lg">
          <div className="flex flex-col items-center justify-center pt-8 pb-6 px-6 text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Log In</CardTitle>
            <CardDescription className="text-gray-500 mt-2 text-base">
              Log in to get started and start creating
            </CardDescription>
          </div>

          <CardContent className="space-y-6 px-6 pb-8">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/v1/auth/google`}
              className="w-full border-gray-200 bg-white text-gray-900 hover:bg-gray-50 h-11 text-base font-medium shadow-sm"
            >
              <img src="/images/icons/google.png" alt="Google" className="w-5 h-5 mr-2" />
              Log in with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <ErrorMessage
                  message={error}
                  type="error"
                  onDismiss={handleClearError}
                />
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="sr-only">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                  className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="sr-only">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    disabled={isLoading}
                    className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 pr-10 h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-gray-900">
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-11 text-base"
              >
                {isLoading ? 'Logging in...' : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Log in with Email
                  </>
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-gray-900 font-bold hover:underline">
                Sign Up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainContent>
  );
}
