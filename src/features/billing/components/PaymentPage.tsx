"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PricingCard } from './PricingCard';
import { CheckoutPage } from './CheckoutPage';
import { StripeCheckoutPage } from './StripeCheckoutPage';
import { PaymentMethodSelector, type PaymentMethod } from './PaymentMethodSelector';
import { PaymentProgress, PaymentSuccess, PaymentFailed } from './PaymentProgress';
import { PaymentHistory } from './PaymentHistory';
import paymentService, { type CreditPackage, type PaymentStatus, type SubscriptionStatus } from '@/services/paymentService';
import { useAuthStore } from '@/contexts/authStore';
import userService from '@/services/userService';
import type { User } from '@/types/user';

type PaymentStep = 'packages' | 'method' | 'checkout' | 'progress' | 'success' | 'failed' | 'history';

export const PaymentPage: React.FC = () => {
  const router = useRouter();
  const { token } = useAuthStore();
  const [, setUser] = useState<User | null>(null);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<PaymentStep>('packages');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentStatus | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadPricing();
    loadUserData();
    loadSubscriptionStatus();
  }, []);

  const loadUserData = async () => {
    if (!token) return;
    try {
      const response = await userService.getCurrentUser(token);
      setUser(response.user);
    } catch (error: any) {
      if (error?.status !== 401) {
        console.error('Failed to load user data:', error);
      }
    }
  };

  const loadPricing = async () => {
    try {
      const data = await paymentService.getPricing();
      setPackages(data.packages);
    } catch {
      setError('Failed to load pricing packages');
    }
  };

  const loadSubscriptionStatus = async () => {
    try {
      const status = await paymentService.getSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (error) {
      console.log('Could not load subscription status:', error);
    }
  };

  const handlePackageSelect = (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setStep('method');
  };

  const handleMethodContinue = () => {
    setStep('checkout');
  };

  const handlePaymentInitiated = (newOrderId: string) => {
    setOrderId(newOrderId);
    setStep('progress');

    paymentService.pollPaymentStatus(
      newOrderId,
      (status) => {
        handlePaymentStatusUpdate(status);
      }
    ).catch((err) => {
      console.error('Polling error:', err);
      setError('Payment status check timeout. Please check your payment history.');
      setStep('failed');
    });
  };

  const handlePaymentStatusUpdate = (status: PaymentStatus) => {
    setPaymentResult(status);

    const statusUpper = status.payment_status.toUpperCase();
    if (statusUpper === 'COMPLETED') {
      setStep('success');
    } else if (statusUpper === 'FAILED' || statusUpper === 'CANCELLED') {
      setError(`Payment ${status.payment_status.toLowerCase()}`);
      setStep('failed');
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await paymentService.openBillingPortal();
      if (response.success && response.portal_url) {
        window.open(response.portal_url, '_blank');
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error);
      setError('Could not open billing portal. Please try again.');
    }
  };

  const handleRetry = () => {
    setStep('method');
    setError(null);
    setOrderId(null);
    setPaymentResult(null);
  };

  const handleClose = () => {
    router.push('/create');
  };

  if (showHistory) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto scrollbar-hide">
        <div className="container mx-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => setShowHistory(false)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Packages
            </button>
            <PaymentHistory />
          </div>
        </div>
      </div>
    );
  }

  // Payment method selection screen
  if (step === 'method' && selectedPackage) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto scrollbar-hide">
        <div className="container mx-auto p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setStep('packages')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Packages
            </button>

            {/* Selected Package Summary */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedPackage.name} Package</h3>
                  <p className="text-sm text-gray-600">{selectedPackage.credits.toLocaleString()} credits</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">${selectedPackage.price_usd.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">TZS {selectedPackage.price_tzs.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onMethodChange={setPaymentMethod}
            />

            {/* Continue Button */}
            <div className="mt-8">
              <button
                onClick={handleMethodContinue}
                className="w-full py-4 bg-black text-white rounded-xl font-medium hover:bg-gray-900 transition-all shadow-lg"
              >
                Continue to {paymentMethod === 'card' ? 'Card Payment' : 'Mobile Money'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Checkout screen - route to appropriate checkout based on payment method
  if (step === 'checkout' && selectedPackage) {
    if (paymentMethod === 'card') {
      return (
        <StripeCheckoutPage
          selectedPackage={selectedPackage}
          onError={(err) => setError(err)}
          onCancel={() => setStep('method')}
        />
      );
    }
    return (
      <CheckoutPage
        selectedPackage={selectedPackage}
        onPaymentInitiated={handlePaymentInitiated}
        onError={(err) => setError(err)}
      />
    );
  }

  // Progress screen
  if (step === 'progress' && orderId && selectedPackage) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto scrollbar-hide">
        <PaymentProgress
          orderId={orderId}
          expectedCredits={selectedPackage.credits}
          onStatusChange={handlePaymentStatusUpdate}
        />
      </div>
    );
  }

  // Success screen
  if (step === 'success' && paymentResult) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto scrollbar-hide">
        <PaymentSuccess
          credits={paymentResult.credits}
          amount={paymentResult.amount_tzs}
          onClose={handleClose}
        />
      </div>
    );
  }

  // Failed screen
  if (step === 'failed') {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto scrollbar-hide">
        <PaymentFailed
          error={error || 'Payment was not completed'}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-950 overflow-y-auto scrollbar-hide">
      {/* Close Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => router.back()}
          className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Close"
        >
          <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      <div className="container mx-auto p-4 md:p-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8 text-center px-4">
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-200 mb-1">
              Choose the perfect plan for your needs
            </p>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
              Unlock powerful AI generation capabilities
            </p>
          </div>

          {/* Subscription Status Badge */}
          {subscriptionStatus?.has_subscription && (
            <div className="mb-6 mx-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-medium text-green-900">Active Subscription</p>
                    <p className="text-sm text-green-700">
                      {subscriptionStatus.period_end && `Renews ${new Date(subscriptionStatus.period_end).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleManageBilling}
                  className="px-4 py-2 text-sm font-medium text-green-800 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
                >
                  Manage Billing
                </button>
              </div>
            </div>
          )}

          {/* Manage Billing for users with payment history */}
          {!subscriptionStatus?.has_subscription && subscriptionStatus?.has_payment_history && (
            <div className="mb-6 mx-4 flex justify-end">
              <button
                onClick={handleManageBilling}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 underline"
              >
                View billing & invoices
              </button>
            </div>
          )}

          {/* Package Selection */}
          {step === 'packages' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
              {packages.map((pkg) => (
                <PricingCard
                  key={pkg.id}
                  package={pkg}
                  isSelected={selectedPackage?.id === pkg.id}
                  onSelect={() => setSelectedPackage(pkg)}
                  onUpgrade={() => handlePackageSelect(pkg)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
