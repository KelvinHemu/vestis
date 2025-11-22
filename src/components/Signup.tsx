import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../contexts/authStore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardTitle } from './ui/card';
import { MainContent } from './MainContent';

interface SignupProps {
  onSuccess?: () => void;
}

export function Signup({ onSuccess }: SignupProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const { signup, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      await signup({ name, email, password });
      onSuccess?.();
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <MainContent showBackButton={false}>
      <div className="flex items-start justify-center mt-8">
        <Card className="w-full max-w-md bg-white border-gray-200">
          <div className="flex items-start p-4">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Create your account</CardTitle>
              <CardDescription className="text-gray-600 text-sm mt-1">
                Sign up to get started
              </CardDescription>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3 pb-4 px-4">
              {displayError && (
                <div className="rounded-md bg-red-50 p-2 text-xs text-red-700 border border-red-200">
                  {displayError}
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="name" className="text-gray-900 text-sm">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  disabled={isSubmitting}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-9 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-gray-900 text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  required
                  disabled={isSubmitting}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-9 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-gray-900 text-sm">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-9 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-gray-900 text-sm">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-9 text-sm"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-9 text-sm mt-2"
              >
                {isSubmitting ? 'Creating account...' : 'Sign Up'}
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-600">Or continue with</span>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline"
                onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/v1/auth/google`}
                className="w-full border-gray-300 bg-white text-gray-900 hover:bg-gray-50 h-9 text-sm"
              >
                <img src="/images/icons/google.png" alt="Google" className="w-4 h-4 mr-2" />
                Sign up with Google
              </Button>
            </CardContent>
          </form>

          <div className="px-4 pb-4 text-center text-xs text-gray-600">
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
