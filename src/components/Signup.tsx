import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useSignup } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardTitle } from './ui/card';
import { ErrorMessage } from './ui/ErrorMessage';
import { MainContent } from './MainContent';

interface SignupProps {
  onSuccess?: () => void;
}

export function Signup({ onSuccess }: SignupProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const { signup, isLoading, error, clearError } = useSignup(onSuccess);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Signup form submitted');
    setLocalError('');
    clearError(); // Clear any previous API errors

    // Validate name
    if (name.trim().length < 2) {
      setLocalError('Name must be at least 2 characters long');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Please enter a valid email address');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setLocalError('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[a-z]/.test(password)) {
      setLocalError('Password must contain at least one lowercase letter');
      return;
    }

    if (!/[0-9]/.test(password)) {
      setLocalError('Password must contain at least one number');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    await signup({ name, email, password });
  };

  const handleClearError = () => {
    console.log('Manually clearing errors');
    clearError();
    setLocalError('');
  };

  const displayError = localError || error;

  return (
    <MainContent showBackButton={false}>
      <div className="min-h-screen bg-white flex items-center justify-center py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6">
        <Card className="w-full max-w-[95%] sm:max-w-md bg-white border-gray-200 shadow-lg">
          <div className="flex items-start p-3 sm:p-4">
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Create your account</CardTitle>
              <CardDescription className="text-gray-600 text-xs sm:text-sm mt-1">
                Sign up to get started
              </CardDescription>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-2.5 sm:space-y-3 pb-3 sm:pb-4 px-3 sm:px-4">
              {displayError && (
                <ErrorMessage
                  message={displayError}
                  type="error"
                  onDismiss={handleClearError}
                />
              )}

              <div className="space-y-1">
                <Label htmlFor="name" className="text-gray-900 text-xs sm:text-sm">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  minLength={2}
                  disabled={isLoading}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-8 sm:h-9 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-gray-900 text-xs sm:text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="veronika@example.com"
                  required
                  disabled={isLoading}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-8 sm:h-9 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-gray-900 text-xs sm:text-sm">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-8 sm:h-9 text-xs sm:text-sm pr-9 sm:pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </button>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500">Must be 8+ characters with uppercase, lowercase, and number</p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-gray-900 text-xs sm:text-sm">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-8 sm:h-9 text-xs sm:text-sm pr-9 sm:pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-8 sm:h-9 text-xs sm:text-sm mt-1.5 sm:mt-2"
              >
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </Button>

              <div className="relative py-1.5 sm:py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-[10px] sm:text-xs">
                  <span className="px-2 bg-white text-gray-600">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/v1/auth/google`}
                className="w-full border-gray-300 bg-white text-gray-900 hover:bg-gray-50 h-8 sm:h-9 text-xs sm:text-sm"
              >
                <img src="/images/icons/google.png" alt="Google" className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Sign up with Google
              </Button>
            </CardContent>
          </form>

          <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-center text-[10px] sm:text-xs text-gray-600">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="text-gray-900 font-semibold hover:text-blue-600">
                Login
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </MainContent>
  );
}
