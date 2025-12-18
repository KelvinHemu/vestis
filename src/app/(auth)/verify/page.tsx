'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { useVerifyEmail } from '@/hooks/useAuth'
import Link from 'next/link'

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const { verifyEmail, isLoading, error, success, message } = useVerifyEmail()

    useEffect(() => {
        if (token) {
            verifyEmail(token)
        }
    }, [token])

    return (
        <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <div className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]">
                <div className="p-8 pb-6">
                    <div className="text-center">
                        <Link
                            href="/"
                            aria-label="go home"
                            className="inline-block">
                            <Logo />
                        </Link>

                        {/* Loading State */}
                        {isLoading && (
                            <>
                                <div className="mt-6 flex justify-center">
                                    <div className="rounded-full bg-primary/10 p-4">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                </div>
                                <h1 className="mb-2 mt-6 text-xl font-semibold">Verifying your email...</h1>
                                <p className="text-sm text-muted-foreground">
                                    Please wait while we verify your email address.
                                </p>
                            </>
                        )}

                        {/* Success State */}
                        {success && (
                            <>
                                <div className="mt-6 flex justify-center">
                                    <div className="rounded-full bg-primary/10 p-4">
                                        <CheckCircle2 className="h-8 w-8 text-primary" />
                                    </div>
                                </div>
                                <h1 className="mb-2 mt-6 text-xl font-semibold">Email verified!</h1>
                                <p className="text-sm text-muted-foreground">
                                    {message || 'Your email has been verified successfully. You can now log in.'}
                                </p>
                                <div className="mt-6">
                                    <Button asChild className="w-full">
                                        <Link href="/login">Continue to Login</Link>
                                    </Button>
                                </div>
                            </>
                        )}

                        {/* Error State */}
                        {error && (
                            <>
                                <div className="mt-6 flex justify-center">
                                    <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
                                        <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                                    </div>
                                </div>
                                <h1 className="mb-2 mt-6 text-xl font-semibold">Verification failed</h1>
                                <p className="text-sm text-muted-foreground">
                                    {error}
                                </p>
                                <div className="mt-6 space-y-3">
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href="/signup">Sign up again</Link>
                                    </Button>
                                    <Button asChild className="w-full">
                                        <Link href="/login">Go to Login</Link>
                                    </Button>
                                </div>
                            </>
                        )}

                        {/* No Token State */}
                        {!token && !isLoading && !success && !error && (
                            <>
                                <div className="mt-6 flex justify-center">
                                    <div className="rounded-full bg-yellow-100 p-4 dark:bg-yellow-900/20">
                                        <XCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                </div>
                                <h1 className="mb-2 mt-6 text-xl font-semibold">Invalid verification link</h1>
                                <p className="text-sm text-muted-foreground">
                                    No verification token found. Please check your email for the correct link.
                                </p>
                                <div className="mt-6">
                                    <Button asChild className="w-full">
                                        <Link href="/login">Go to Login</Link>
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
                <div className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md">
                    <div className="p-8 pb-6 text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                        <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
                    </div>
                </div>
            </section>
        }>
            <VerifyEmailContent />
        </Suspense>
    )
}
