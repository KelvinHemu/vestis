import React, { useState, useEffect } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PricingCard } from './PricingCard';
import { CheckoutPage } from './CheckoutPage';
import { PaymentProgress, PaymentSuccess, PaymentFailed } from './PaymentProgress';
import { PaymentHistory } from './PaymentHistory';
import paymentService, { type CreditPackage, type PaymentStatus } from '../services/paymentService';
import { useAuthStore } from '../contexts/authStore';
import userService from '../services/userService';
import type { User } from '../types/user';

type PaymentStep = 'packages' | 'checkout' | 'progress' | 'success' | 'failed' | 'history';

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [, setUser] = useState<User | null>(null);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<PaymentStep>('packages');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentStatus | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadPricing();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (!token) return;
    try {
      const response = await userService.getCurrentUser(token);
      setUser(response.user);
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  };

  const loadPricing = async () => {
    try {
      const data = await paymentService.getPricing();
      setPackages(data.packages);
    } catch (err) {
      setError('Failed to load pricing packages');
    }
  };

  const handlePaymentInitiated = (newOrderId: string) => {
    setOrderId(newOrderId);
    setStep('progress');
    
    // Start polling for status
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

  const handleRetry = () => {
    setStep('checkout');
    setError(null);
    setOrderId(null);
    setPaymentResult(null);
  };

  const handleClose = () => {
    navigate('/create');
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

  // Checkout screen - Using new CheckoutPage component
  if (step === 'checkout' && selectedPackage) {
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
    <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto scrollbar-hide">
      {/* Close Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-100 transition-colors"
          title="Close"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="container mx-auto p-4 md:p-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8 text-center px-4">
            <p className="text-base md:text-lg text-gray-600 mb-1">
              Choose the perfect plan for your needs
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              Unlock powerful AI generation capabilities
            </p>
          </div>

          {/* Package Selection */}
          {step === 'packages' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
              {/* Paid Package Cards */}
              {packages.map((pkg) => (
                <PricingCard
                  key={pkg.id}
                  package={pkg}
                  isSelected={selectedPackage?.id === pkg.id}
                  onSelect={() => setSelectedPackage(pkg)}
                  onUpgrade={() => {
                    setSelectedPackage(pkg);
                    setStep('checkout');
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
