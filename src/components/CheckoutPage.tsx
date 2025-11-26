import React, { useState } from 'react';
import { Smartphone, AlertCircle } from 'lucide-react';
import type { CreditPackage } from '../services/paymentService';
import paymentService from '../services/paymentService';

interface CheckoutPageProps {
  selectedPackage: CreditPackage;
  onPaymentInitiated: (orderId: string) => void;
  onError: (error: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  selectedPackage,
  onPaymentInitiated,
  onError,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePhoneNumber = (phone: string) => {
    if (!phone.trim()) {
      setPhoneError('Phone number is required');
      return false;
    }
    if (!paymentService.validatePhoneNumber(phone)) {
      setPhoneError('Invalid format. Use: 0712345678');
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

  const handleSubmit = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
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
        onPaymentInitiated(response.order_id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate payment';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Left Panel - Pure Black with Minimal Package Info */}
      <div className="hidden md:flex md:w-2/5 lg:w-1/2 bg-black text-white flex-col justify-between p-8 lg:p-12">
        {/* Logo at Top */}
        <div>
          <img 
            src="/Vestis.svg" 
            alt="Vestis" 
            className="h-8 w-auto brightness-0 invert"
          />
        </div>

        {/* Package Info - Centered */}
        <div>
          <p className="text-gray-500 text-sm uppercase tracking-wider mb-3">
            {selectedPackage.name} Plan
          </p>
          <div className="flex items-baseline">
            <span className="text-5xl lg:text-6xl font-light tracking-tight">
              TZS {selectedPackage.price_tzs.toLocaleString()}
            </span>
          </div>
          <p className="text-gray-600 text-sm mt-2">
            ${selectedPackage.price_usd.toFixed(2)} USD · {selectedPackage.credits.toLocaleString()} credits
          </p>
        </div>

        {/* Footer */}
        <div className="text-gray-600 text-xs">
          Secure payment powered by ZenoPay
        </div>
      </div>

      {/* Right Panel - Clean & Business Focused */}
      <div className="w-full md:w-3/5 lg:w-1/2 bg-white flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-24">
          <div className="max-w-md mx-auto w-full">
            {/* Mobile Package Summary - Only visible on mobile */}
            <div className="md:hidden mb-10 p-5 bg-black text-white rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/Vestis.svg" 
                  alt="Vestis" 
                  className="h-6 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-gray-500 text-xs uppercase tracking-wider">{selectedPackage.name} Plan</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-light">
                  TZS {selectedPackage.price_tzs.toLocaleString()}
                </span>
              </div>
              <p className="text-gray-600 text-xs mt-1">
                {selectedPackage.credits.toLocaleString()} credits
              </p>
            </div>

            {/* Payment Form */}
            <div className="space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-2xl font-light text-gray-900">Contact information</h1>
              </div>

              {/* Mobile Money Input */}
              <div>
                <label className="block text-sm font-normal text-gray-600 mb-3">
                  Phone
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    onBlur={() => phoneNumber && validatePhoneNumber(phoneNumber)}
                    placeholder="0712345678"
                    className={`w-full px-4 py-3.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-base font-light ${
                      phoneError 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-300 focus:border-gray-900'
                    }`}
                  />
                </div>
                {phoneError && (
                  <p className="mt-2 text-sm text-red-500 font-light">{phoneError}</p>
                )}
              </div>

              {/* Payment Method Label */}
              <div>
                <label className="block text-sm font-normal text-gray-600 mb-3">
                  Payment method
                </label>
                <div className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
                  <Smartphone className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-normal text-gray-900">Mobile Money</span>
                  <div className="ml-auto flex items-center gap-2">
                    <img src="/images/icons/vodacom.png" alt="M-Pesa" className="h-4 w-auto object-contain" />
                    <img src="/images/icons/tigo-seeklogo.png" alt="Tigo" className="h-4 w-auto object-contain" />
                    <img src="/images/icons/airtel-seeklogo.png" alt="Airtel" className="h-4 w-auto object-contain" />
                  </div>
                </div>
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
                disabled={isLoading || !phoneNumber.trim()}
                className="w-full py-3.5 bg-black text-white rounded-lg font-normal hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Processing...
                  </span>
                ) : (
                  `Pay TZS ${selectedPackage.price_tzs.toLocaleString()}`
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer with Terms */}
        <div className="px-8 py-6 lg:px-24 border-t border-gray-100">
          <p className="text-center text-xs text-gray-500 mb-3 font-light">
            By subscribing, you authorize Vestis to charge you according to the terms until you cancel.
          </p>
          <div className="flex items-center justify-center gap-1 text-xs text-gray-400 font-light">
            <span>Powered by <span className="font-normal text-gray-600">ZenoPay</span></span>
            <span className="mx-2">|</span>
            <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
            <span>·</span>
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
          </div>
        </div>
      </div>
    </div>
  );
};
