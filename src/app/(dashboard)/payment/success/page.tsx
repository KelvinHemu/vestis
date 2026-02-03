'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');
    const sessionId = searchParams.get('session_id');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate a brief loading state for webhook processing
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                {isLoading ? (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <Loader2 className="h-16 w-16 text-gray-400 animate-spin" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Processing payment...</h1>
                            <p className="text-gray-600 mt-2">Please wait while we confirm your payment.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Success Icon */}
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                                <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-full p-4">
                                    <CheckCircle className="h-12 w-12 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Success Message */}
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold text-gray-900">Payment Successful!</h1>
                            <p className="text-gray-600 text-lg">
                                Your credits have been added to your account.
                            </p>
                        </div>

                        {/* Order Details */}
                        {orderId && (
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Order ID</span>
                                        <span className="text-sm font-medium text-gray-900 font-mono">
                                            {orderId.slice(0, 8)}...
                                        </span>
                                    </div>
                                    {sessionId && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Session</span>
                                            <span className="text-sm font-medium text-gray-900 font-mono">
                                                {sessionId.slice(0, 12)}...
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Status</span>
                                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                            Completed
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Link
                                href="/dashboard"
                                className="flex items-center justify-center gap-2 w-full py-3.5 bg-black text-white rounded-xl font-medium hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl"
                            >
                                Go to Dashboard
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                            <Link
                                href="/payment"
                                className="flex items-center justify-center w-full py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                            >
                                Buy more credits
                            </Link>
                        </div>

                        {/* Help Text */}
                        <p className="text-xs text-gray-500">
                            A receipt has been sent to your email. If you have any questions,{' '}
                            <a href="mailto:support@vestis.com" className="text-gray-900 underline hover:no-underline">
                                contact support
                            </a>
                            .
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
