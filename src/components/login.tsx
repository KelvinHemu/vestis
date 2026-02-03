'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff, RefreshCw, CheckCircle2 } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { useLogin } from '@/hooks/useAuth'
import Link from 'next/link'

// Storage key for OAuth redirect
const OAUTH_REDIRECT_KEY = 'oauth_redirect';

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const searchParams = useSearchParams()

    const {
        login,
        isLoading,
        error,
        clearError,
        needsVerification,
        resendVerification,
        resendLoading,
        resendSuccess,
    } = useLogin()

    // Build Google OAuth URL
    const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/v1/auth/google`

    // Handle Google OAuth click - store redirect URL before navigating
    const handleGoogleAuth = () => {
        const redirectTo = searchParams.get('redirect')
        if (redirectTo) {
            // Store redirect URL for after OAuth completes
            sessionStorage.setItem(OAUTH_REDIRECT_KEY, redirectTo)
        }
        window.location.href = googleAuthUrl
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await login({ email, password })
    }

    return (
        <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <form
                onSubmit={handleSubmit}
                className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]">
                <div className="p-8 pb-6">
                    <div>
                        <Link
                            href="/"
                            aria-label="go home">
                            <Logo />
                        </Link>
                        <h1 className="mb-1 mt-4 text-xl font-semibold">Sign In to Vestis</h1>
                        <p className="text-sm text-muted-foreground">Welcome back! Sign in to continue</p>
                    </div>

                    {/* Google Sign In Button - Full Width */}
                    <div className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handleGoogleAuth}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="0.98em"
                                height="1em"
                                viewBox="0 0 256 262">
                                <path
                                    fill="#4285f4"
                                    d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
                                <path
                                    fill="#34a853"
                                    d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
                                <path
                                    fill="#fbbc05"
                                    d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"></path>
                                <path
                                    fill="#eb4335"
                                    d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
                            </svg>
                            <span>Sign in with Google</span>
                        </Button>
                    </div>

                    <hr className="my-4 border-dashed" />

                    <div className="space-y-6">
                        {/* Resend Success Message */}
                        {resendSuccess && (
                            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                <CheckCircle2 className="h-4 w-4" />
                                Verification email sent! Please check your inbox.
                            </div>
                        )}

                        {/* Verification Error with Resend */}
                        {needsVerification && error && (
                            <div className="space-y-3">
                                <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                                    <p className="font-medium">Email not verified</p>
                                    <p className="mt-1 text-yellow-600 dark:text-yellow-500">
                                        Please verify your email before logging in.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={resendVerification}
                                    disabled={resendLoading}
                                >
                                    {resendLoading ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Resend verification email
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* Regular Error Message (non-verification) */}
                        {error && !needsVerification && (
                            <ErrorMessage
                                message={error}
                                type="error"
                                onDismiss={clearError}
                            />
                        )}

                        {/* Email Input */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="block text-sm">
                                Email
                            </Label>
                            <Input
                                type="email"
                                required
                                name="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                placeholder="Enter your email"
                            />
                        </div>

                        {/* Password Input with Toggle */}
                        <div className="space-y-0.5">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="pwd"
                                    className="text-sm">
                                    Password
                                </Label>
                                <Button
                                    asChild
                                    variant="link"
                                    size="sm">
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm">
                                        Forgot your Password?
                                    </Link>
                                </Button>
                            </div>
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    name="pwd"
                                    id="pwd"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    placeholder="Enter your password"
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </div>
                </div>

                <div className="bg-muted rounded-(--radius) border p-3">
                    <p className="text-accent-foreground text-center text-sm">
                        Don't have an account?
                        <Button
                            asChild
                            variant="link"
                            className="px-2">
                            <Link href={searchParams.get('redirect') ? `/signup?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : '/signup'}>Create account</Link>
                        </Button>
                    </p>
                </div>
            </form>
        </section>
    )
}
