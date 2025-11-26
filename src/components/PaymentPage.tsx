import React, { useState, useEffect } from 'react';
import { ArrowLeft, Smartphone, AlertCircle } from 'lucide-react';
import { PricingCard } from './PricingCard';
import { PaymentProgress, PaymentSuccess, PaymentFailed } from './PaymentProgress';
import { PaymentHistory } from './PaymentHistory';
import paymentService, { type CreditPackage, type PaymentStatus } from '../services/paymentService';
import { useAuthStore } from '../contexts/authStore';
import userService from '../services/userService';
import type { User } from '../types/user';

type PaymentStep = 'packages' | 'checkout' | 'progress' | 'success' | 'failed' | 'history';

export const PaymentPage: React.FC = () => {
  const { token } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      // Auto-select recommended package
      const recommended = data.packages.find(pkg => pkg.recommended);
      if (recommended) {
        setSelectedPackage(recommended);
      }
    } catch (err) {
      setError('Failed to load pricing packages');
    }
  };

  const validatePhoneNumber = (phone: string) => {
    if (!phone.trim()) {
      setPhoneError('Phone number is required');
      return false;
    }
    if (!paymentService.validatePhoneNumber(phone)) {
      setPhoneError('Invalid phone number. Use format: 0712345678 or 255712345678');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    if (phoneError) {
      validatePhoneNumber(value);
    }
  };

  const handleContinueToCheckout = () => {
    if (!selectedPackage) {
      alert('Please select a package');
      return;
    }
    setStep('checkout');
  };

  const handleInitiatePayment = async () => {
    if (!validatePhoneNumber(phoneNumber) || !selectedPackage) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentService.createPayment({
        package_id: selectedPackage.id,
        buyer_phone: phoneNumber.trim(),
      });

      if (response.success) {
        setOrderId(response.order_id);
        setStep('progress');
        
        // Start polling for status
        paymentService.pollPaymentStatus(
          response.order_id,
          (status) => {
            handlePaymentStatusUpdate(status);
          }
        ).catch((err) => {
          console.error('Polling error:', err);
          setError('Payment status check timeout. Please check your payment history.');
          setStep('failed');
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate payment');
      setStep('failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentStatusUpdate = (status: PaymentStatus) => {
    setPaymentResult(status);
    
    if (status.payment_status === 'COMPLETED') {
      setStep('success');
    } else if (status.payment_status === 'FAILED' || status.payment_status === 'CANCELLED') {
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
    setStep('packages');
    setSelectedPackage(packages.find(pkg => pkg.recommended) || null);
    setPhoneNumber('');
    setPhoneError('');
    setError(null);
    setOrderId(null);
    setPaymentResult(null);
    loadUserData(); // Refresh user credits
  };

  const handleBackToPackages = () => {
    setStep('packages');
    setPhoneError('');
  };

  if (showHistory) {
    return (
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
    );
  }

  // Progress screen
  if (step === 'progress' && orderId && selectedPackage) {
    return (
      <PaymentProgress
        orderId={orderId}
        expectedCredits={selectedPackage.credits}
        onStatusChange={handlePaymentStatusUpdate}
      />
    );
  }

  // Success screen
  if (step === 'success' && paymentResult) {
    return (
      <PaymentSuccess
        credits={paymentResult.credits}
        amount={paymentResult.amount_tzs}
        onClose={handleClose}
      />
    );
  }

  // Failed screen
  if (step === 'failed') {
    return (
      <PaymentFailed
        error={error || 'Payment was not completed'}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8 text-center px-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 md:mb-3">
            Vestis Credits
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-1">
            Choose the perfect plan for your needs
          </p>
          <p className="text-xs md:text-sm text-gray-500">
            Unlock powerful AI generation capabilities
          </p>
        </div>

        {/* Checkout Step */}
        {step === 'checkout' && selectedPackage && (
          <div className="max-w-2xl mx-auto px-4">
            <div className="mb-6 md:mb-8 text-center">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-3">
                Complete Payment
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Enter your mobile money details to complete the purchase
              </p>
            </div>

            <button
              onClick={handleBackToPackages}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Packages
            </button>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              {/* Selected Package Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Selected Package:</span>
                  <span className="text-xl font-bold text-gray-900">{selectedPackage.name}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Credits:</span>
                  <span className="text-lg font-semibold text-gray-900">{selectedPackage.credits.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="text-2xl font-bold text-gray-900">
                    TZS {selectedPackage.price_tzs.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Phone Number Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Mobile Money Number
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    onBlur={() => validatePhoneNumber(phoneNumber)}
                    placeholder="0712345678 or 255712345678"
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                      phoneError 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-gray-900 focus:ring-gray-200'
                    }`}
                  />
                </div>
                {phoneError && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {phoneError}
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Enter your M-Pesa, Tigo Pesa, or Airtel Money number
                </p>
              </div>

              {/* Payment Info */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-gray-700">
                  You will receive an USSD prompt on your phone to authorize the payment.
                  Enter your mobile money PIN to complete the transaction.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleInitiatePayment}
                disabled={isLoading || !phoneNumber.trim()}
                className="w-full py-4 px-6 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Processing...
                  </span>
                ) : (
                  `Pay TZS ${selectedPackage.price_tzs.toLocaleString()}`
                )}
              </button>
            </div>
          </div>
        )}

        {/* Package Selection */}
        {step === 'packages' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 px-4">
              {/* Paid Package Cards */}
              {packages.map((pkg) => (
                <PricingCard
                  key={pkg.id}
                  package={pkg}
                  isSelected={selectedPackage?.id === pkg.id}
                  onSelect={() => setSelectedPackage(pkg)}
                />
              ))}
            </div>

            {/* Continue Button */}
            {selectedPackage && (
              <div className="flex justify-center px-4">
                <button
                  onClick={handleContinueToCheckout}
                  className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Generation Costs Info */}
            <div className="mt-8 md:mt-12 max-w-4xl mx-auto px-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 text-center">
                How Credits Work
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <div className="p-3 md:p-4 bg-white rounded-xl border border-gray-200">
                  <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1">1</div>
                  <div className="text-xs md:text-sm text-gray-600">Background Change</div>
                </div>
                <div className="p-3 md:p-4 bg-white rounded-xl border border-gray-200">
                  <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1">2</div>
                  <div className="text-xs md:text-sm text-gray-600">On Model Photo</div>
                </div>
                <div className="p-3 md:p-4 bg-white rounded-xl border border-gray-200">
                  <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1">3</div>
                  <div className="text-xs md:text-sm text-gray-600">Flat Lay Photo</div>
                </div>
                <div className="p-3 md:p-4 bg-white rounded-xl border border-gray-200">
                  <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1">3</div>
                  <div className="text-xs md:text-sm text-gray-600">Mannequin Photo</div>
                </div>
                <div className="p-3 md:p-4 bg-white rounded-xl border border-gray-200">
                  <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1">1</div>
                  <div className="text-xs md:text-sm text-gray-600">Chat Generation</div>
                </div>
                <div className="p-3 md:p-4 bg-white rounded-xl border border-gray-200">
                  <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1">2</div>
                  <div className="text-xs md:text-sm text-gray-600">Legacy Feature</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
