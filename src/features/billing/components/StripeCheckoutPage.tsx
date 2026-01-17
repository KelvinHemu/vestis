'use client';

import React, { useState } from 'react';
import { CreditCard, AlertCircle } from 'lucide-react';
import type { CreditPackage } from '@/services/paymentService';
import paymentService from '@/services/paymentService';

interface StripeCheckoutPageProps {
    selectedPackage: CreditPackage;
    onError: (error: string) => void;
    onCancel?: () => void;
}

type BillingType = 'one-time' | 'subscription';

export const StripeCheckoutPage: React.FC<StripeCheckoutPageProps> = ({
    selectedPackage,
    onError,
    onCancel,
}) => {
    const [billingType, setBillingType] = useState<BillingType>('one-time');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);

        try {
            console.log('💳 Creating Stripe checkout for package:', selectedPackage.id);

            const response = billingType === 'subscription'
                ? await paymentService.createStripeSubscription(selectedPackage.id)
                : await paymentService.createStripeCheckout(selectedPackage.id);

            console.log('✅ Stripe checkout created:', response);

            if (response.success && response.checkout_url) {
                // Redirect to Stripe Checkout
                window.location.href = response.checkout_url;
            } else {
                throw new Error('Invalid checkout response');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to initiate payment';
            console.error('❌ Stripe checkout failed:', err);
            setError(errorMessage);
            onError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex overflow-hidden">
            {/* Left Panel - Pure Black with Package Info */}
            <div className="hidden md:flex md:w-2/5 lg:w-1/2 bg-black text-white flex-col justify-between p-8 lg:p-12">
                {/* Logo at Top */}
                <div className="flex items-center justify-between">
                    <img
                        src="/Vestis.svg"
                        alt="Vestis"
                        className="h-8 w-auto brightness-0 invert"
                    />
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="text-gray-500 hover:text-white transition-colors text-sm"
                        >
                            ← Back
                        </button>
                    )}
                </div>

                {/* Package Info - Centered */}
                <div>
                    <p className="text-gray-500 text-sm uppercase tracking-wider mb-3">
                        {selectedPackage.name} Plan
                    </p>
                    <div className="flex items-baseline">
                        <span className="text-5xl lg:text-6xl font-light tracking-tight">
                            ${selectedPackage.price_usd.toFixed(2)}
                        </span>
                        {billingType === 'subscription' && (
                            <span className="text-gray-500 text-lg ml-2">/month</span>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm mt-2">
                        {selectedPackage.credits.toLocaleString()} credits
                        {billingType === 'subscription' && ' • Auto-renews monthly'}
                    </p>
                </div>

                {/* Footer */}
                <div className="text-gray-600 text-xs">
                    Secure payment powered by Stripe
                </div>
            </div>

            {/* Right Panel - Clean & Business Focused */}
            <div className="w-full md:w-3/5 lg:w-1/2 bg-white dark:bg-gray-900 flex flex-col">
                <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-24">
                    <div className="max-w-md mx-auto w-full">
                        {/* Mobile Package Summary - Only visible on mobile */}
                        <div className="md:hidden mb-10 p-5 bg-black text-white rounded-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <img
                                    src="/Vestis.svg"
                                    alt="Vestis"
                                    className="h-6 w-auto brightness-0 invert"
                                />
                                {onCancel && (
                                    <button
                                        onClick={onCancel}
                                        className="text-gray-500 hover:text-white transition-colors text-xs"
                                    >
                                        ← Back
                                    </button>
                                )}
                            </div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">{selectedPackage.name} Plan</p>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-2xl font-light">
                                    ${selectedPackage.price_usd.toFixed(2)}
                                </span>
                                {billingType === 'subscription' && (
                                    <span className="text-gray-500 text-sm">/month</span>
                                )}
                            </div>
                            <p className="text-gray-600 text-xs mt-1">
                                {selectedPackage.credits.toLocaleString()} credits
                            </p>
                        </div>

                        {/* Payment Form */}
                        <div className="space-y-8">
                            {/* Header */}
                            <div>
                                <h1 className="text-2xl font-light text-gray-900 dark:text-white">Payment details</h1>
                            </div>

                            {/* Payment Method Label */}
                            <div>
                                <label className="block text-sm font-normal text-gray-600 dark:text-gray-400 mb-3">
                                    Payment method
                                </label>
                                <div className="flex items-center gap-3 p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                                    <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    <span className="text-sm font-normal text-gray-900 dark:text-white">Card Payment</span>
                                    <div className="ml-auto flex items-center gap-2">
                                        <img src="/images/icons/visa.svg" alt="Visa" className="h-6 w-auto object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                                        <img src="/images/icons/mastercard.svg" alt="Mastercard" className="h-6 w-auto object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    You&apos;ll be redirected to Stripe to complete your payment securely.
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-normal text-red-900">Payment failed</p>
                                            <p className="text-sm text-red-700 mt-0.5 font-light">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="w-full py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-normal hover:bg-gray-900 dark:hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Processing...
                                    </span>
                                ) : billingType === 'subscription' ? (
                                    `Subscribe for $${selectedPackage.price_usd.toFixed(2)}/month`
                                ) : (
                                    `Pay $${selectedPackage.price_usd.toFixed(2)}`
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer with Terms */}
                <div className="px-8 py-6 lg:px-24 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-3 font-light">
                        {billingType === 'subscription'
                            ? 'By subscribing, you authorize Vestis to charge you monthly until you cancel.'
                            : 'By proceeding, you agree to Vestis terms of service.'}
                    </p>
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-400 dark:text-gray-500 font-light">
                        <span>Powered by <span className="font-normal text-gray-600 dark:text-gray-400">Stripe</span></span>
                        <span className="mx-2">|</span>
                        <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Terms</a>
                        <span>·</span>
                        <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Privacy</a>
                    </div>
                </div>
            </div>
        </div>
    );
};
