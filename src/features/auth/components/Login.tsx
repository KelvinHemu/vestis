"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { useLogin } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { MainContent } from '@/components/layout/MainContent';

/* ============================================
   Login Component
   Handles email/password and Google OAuth login
   Navigation to dashboard handled by useLogin hook
   ============================================ */

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error, clearError } = useLogin();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  // Handle error dismissal
  const handleClearError = () => {
    clearError();
  };

  // Build Google OAuth URL with Next.js env variable
  const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/v1/auth/google`;

  return (
    <MainContent showBackButton={false}>
      <div className="min-h-screen bg-white flex items-center justify-center py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6">
        <Card className="w-full max-w-[95%] sm:max-w-md bg-white border-gray-200 shadow-lg">
          {/* Header */}
          <div className="flex flex-col items-center justify-center pt-8 pb-6 px-6 text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Log In</CardTitle>
            <CardDescription className="text-gray-500 mt-2 text-base">
              Log in to get started and start creating
            </CardDescription>
          </div>

          <CardContent className="space-y-6 px-6 pb-8">
            {/* Google OAuth Button */}
            <Button 
              type="button" 
              variant="outline"
              onClick={() => window.location.href = googleAuthUrl}
              className="w-full border-gray-200 bg-white text-gray-900 hover:bg-gray-50 h-11 text-base font-medium shadow-sm"
            >
              <img src="/images/icons/google.png" alt="Google" className="w-5 h-5 mr-2" />
              Log in with Google
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message Display */}
              {error && (
                <ErrorMessage
                  message={error}
                  type="error"
                  onDismiss={handleClearError}
                />
              )}

              {/* Email Input */}
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

              {/* Password Input */}
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
                  <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-gray-900">
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
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

            {/* Sign Up Link */}
            <div className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-gray-900 font-bold hover:underline">
                Sign Up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainContent>
  );
}
