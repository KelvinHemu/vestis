"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { MainContent } from '@/components/layout/MainContent';

/* ============================================
   Signup Component
   Handles new user registration via Google OAuth
   ============================================ */

export function Signup() {
  // Build Google OAuth URLs with Next.js env variable
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  const googleAuthUrl = `${apiBaseUrl}/v1/auth/google`;
  const googleAuthModelUrl = `${apiBaseUrl}/v1/auth/google?role=model`;

  return (
    <MainContent showBackButton={false}>
      <div className="min-h-screen bg-white flex items-center justify-center py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6">
        <Card className="w-full max-w-[95%] sm:max-w-md bg-white border-gray-200 shadow-lg">
          {/* Hero Image */}
          <div className="p-5 pb-0">
            <div className="w-full h-48 bg-gray-100 relative overflow-hidden rounded-xl">
              <img 
                src="https://res.cloudinary.com/ds4lpuk8p/image/upload/v1763907019/signin_x0ajou.jpg" 
                alt="Create account" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Header */}
          <div className="flex flex-col items-center justify-center pt-6 pb-2 px-6 text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Create an account</CardTitle>
            <CardDescription className="text-gray-500 mt-2 text-base">
              Sign Up to get started and start creating
            </CardDescription>
          </div>

          <CardContent className="space-y-6 px-6 pb-8">
            {/* Google Sign Up Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.href = googleAuthUrl}
              className="w-full border-gray-200 bg-white text-gray-900 hover:bg-gray-50 h-11 text-base font-medium shadow-sm"
            >
              <img src="/images/icons/google.png" alt="Google" className="w-5 h-5 mr-2" />
              Sign up with Google
            </Button>

            {/* Model Sign Up Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.href = googleAuthModelUrl}
              className="w-full border-gray-200 bg-white text-gray-900 hover:bg-gray-50 h-11 text-base font-medium shadow-sm"
            >
              Sign up as a Model
            </Button>

            {/* Login Link */}
            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-gray-900 font-bold hover:underline">
                Log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainContent>
  );
}
