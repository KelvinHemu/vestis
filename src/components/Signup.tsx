import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail } from 'lucide-react';
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


  return (
    <MainContent showBackButton={false}>
      <div className="min-h-screen bg-white flex items-center justify-center py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6">
        <Card className="w-full max-w-[95%] sm:max-w-md bg-white border-gray-200 shadow-lg">
          <div className="p-5 pb-0">
            <div className="w-full h-48 bg-gray-100 relative overflow-hidden rounded-xl">
              <img 
                src="https://res.cloudinary.com/ds4lpuk8p/image/upload/v1763907019/signin_x0ajou.jpg" 
                alt="Create account" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center pt-6 pb-2 px-6 text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Create an account</CardTitle>
            <CardDescription className="text-gray-500 mt-2 text-base">
              Sign Up to get started and start creating
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
              Sign up with Google
            </Button>

            {/* 
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {displayError && (
                <ErrorMessage
                  message={displayError}
                  type="error"
                  onDismiss={handleClearError}
                />
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="sr-only">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  required
                  minLength={2}
                  disabled={isLoading}
                  className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="sr-only">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
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
                    minLength={8}
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
                <p className="text-xs text-gray-500">Must be 8+ characters with uppercase, lowercase, and number</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="sr-only">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    required
                    disabled={isLoading}
                    className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 pr-10 h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-11 text-base"
              >
                {isLoading ? 'Creating account...' : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Sign Up with Email
                  </>
                )}
              </Button>
            </form>
            */}

            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-gray-900 font-bold hover:underline">
                Log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainContent>
  );
}
