'use client'

import { useState } from 'react'
import { Mail, RefreshCw, CheckCircle2 } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/contexts/authStore'
import { useResendVerification } from '@/hooks/useAuth'
import Link from 'next/link'

export default function CheckEmailPage() {
    const { pendingVerificationEmail } = useAuthStore()
    const { resendVerification, isLoading, success, error } = useResendVerification()

    const handleResend = async () => {
        if (pendingVerificationEmail) {
            await resendVerification(pendingVerificationEmail)
        }
    }

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

                        {/* Email Icon */}
                        <div className="mt-6 flex justify-center">
                            <div className="rounded-full bg-primary/10 p-4">
                                <Mail className="h-8 w-8 text-primary" />
                            </div>
                        </div>

                        <h1 className="mb-2 mt-6 text-xl font-semibold">Check your email</h1>
                        <p className="text-sm text-muted-foreground">
                            We've sent a verification link to
                        </p>
                        {pendingVerificationEmail && (
                            <p className="mt-1 font-medium text-foreground">
                                {pendingVerificationEmail}
                            </p>
                        )}
                    </div>

                    <div className="mt-8 space-y-4">
                        {/* Success Message */}
                        {success && (
                            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                <CheckCircle2 className="h-4 w-4" />
                                Verification email sent!
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        {/* Resend Button */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handleResend}
                            disabled={isLoading || !pendingVerificationEmail}
                        >
                            {isLoading ? (
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

                        <p className="text-center text-xs text-muted-foreground">
                            Didn't receive the email? Check your spam folder or click above to resend.
                        </p>
                    </div>
                </div>

                <div className="bg-muted rounded-(--radius) border p-3">
                    <p className="text-accent-foreground text-center text-sm">
                        Wrong email?
                        <Button
                            asChild
                            variant="link"
                            className="px-2">
                            <Link href="/signup">Sign up again</Link>
                        </Button>
                    </p>
                </div>
            </div>
        </section>
    )
}
