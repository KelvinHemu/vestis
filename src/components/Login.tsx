import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
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
          <div className="flex items-start justify-between p-4 sm:p-5 md:p-6">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Login to your account</CardTitle>
              <CardDescription className="text-gray-600 mt-1.5 sm:mt-2 text-sm sm:text-base">
                Enter your email below to login to your account
              </CardDescription>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 sm:space-y-5 md:space-y-6 pb-4 sm:pb-5 md:pb-6 px-4 sm:px-5 md:px-6">
              {error && (
                <ErrorMessage
                  message={error}
                  type="error"
                  onDismiss={handleClearError}
                />
              )}

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="email" className="text-gray-900 text-sm sm:text-base">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kelvin@example.com"
                  required
                  disabled={isLoading}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-9 sm:h-10 text-sm sm:text-base"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="password" className="text-gray-900 text-sm sm:text-base">Password</Label>
                  <Link to="/forgot-password" className="text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 pr-10 h-9 sm:h-10 text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-9 sm:h-10 text-sm sm:text-base"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs sm:text-sm">
                  <span className="px-2 bg-white text-gray-600">Or continue with</span>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline"
                onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/v1/auth/google`}
                className="w-full border-gray-300 bg-white text-gray-900 hover:bg-gray-50 h-9 sm:h-10 text-sm sm:text-base"
              >
                <img src="/images/icons/google.png" alt="Google" className="w-4 h-4 mr-2" />
                Login with Google
              </Button>
            </CardContent>
          </form>

          <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 text-center text-xs sm:text-sm text-gray-600 space-y-2 sm:space-y-3">
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
