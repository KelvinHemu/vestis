'use client';

import React from 'react';
import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentCancelPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <div className="space-y-8">
                    {/* Cancel Icon */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-orange-400 rounded-full blur-xl opacity-20"></div>
                            <div className="relative bg-gradient-to-br from-orange-400 to-orange-500 rounded-full p-4">
                                <XCircle className="h-12 w-12 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Cancel Message */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900">Payment Cancelled</h1>
                        <p className="text-gray-600 text-lg">
                            Your payment was not completed. No charges were made.
                        </p>
                    </div>

                    {/* Order Info */}
                    {orderId && (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Order Reference</span>
                                <span className="text-sm font-medium text-gray-900 font-mono">
                                    {orderId.slice(0, 8)}...
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Link
                            href="/payment"
                            className="flex items-center justify-center gap-2 w-full py-3.5 bg-black text-white rounded-xl font-medium hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl"
                        >
                            <RotateCcw className="h-5 w-5" />
                            Try Again
                        </Link>
                        <Link
                            href="/dashboard"
                            className="flex items-center justify-center gap-2 w-full py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </div>

                    {/* Help Text */}
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                            Having trouble completing your payment?
                        </p>
                        <div className="flex items-center justify-center gap-4 text-sm">
                            <a
                                href="mailto:support@vestis.com"
                                className="text-gray-900 underline hover:no-underline font-medium"
                            >
                                Contact support
                            </a>
                            <span className="text-gray-300">|</span>
                            <Link
                                href="/pricing"
                                className="text-gray-900 underline hover:no-underline font-medium"
                            >
                                View pricing
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
