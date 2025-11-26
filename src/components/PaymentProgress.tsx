import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import paymentService, { type PaymentStatus } from '../services/paymentService';

interface PaymentProgressProps {
  orderId: string;
  expectedCredits: number;
  onStatusChange: (status: PaymentStatus) => void;
}

export const PaymentProgress: React.FC<PaymentProgressProps> = ({
  orderId,
  expectedCredits,
  onStatusChange,
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const MAX_ERRORS = 5; // Stop polling after 5 consecutive errors

  // Timer for elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Poll payment status
  useEffect(() => {
    let isActive = true;
    let pollInterval: ReturnType<typeof setInterval>;
    let consecutiveErrors = 0;

    const checkPaymentStatus = async () => {
      try {
        console.log('🔍 Checking payment status for order:', orderId);
        const status = await paymentService.getPaymentStatus(orderId);
        
        console.log('✅ Payment status received:', status.payment_status);
        
        // Reset error count on success
        consecutiveErrors = 0;
        
        if (!isActive) return;

        // Always call onStatusChange to update parent
        onStatusChange(status);

        // Stop polling if payment is complete, failed, or cancelled
        const statusUpper = status.payment_status.toUpperCase();
        if (statusUpper === 'COMPLETED' || 
            statusUpper === 'FAILED' || 
            statusUpper === 'CANCELLED') {
          console.log('🛑 Stopping poll - Payment is', status.payment_status);
          clearInterval(pollInterval);
        }
      } catch (error) {
        consecutiveErrors++;
        
        console.error('❌ Error checking payment status:', error);
        
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          
          // If we get too many errors, stop polling and show error
          if (consecutiveErrors >= MAX_ERRORS) {
            console.error('🛑 Too many errors, stopping poll');
            clearInterval(pollInterval);
            
            // Create a mock failed status to trigger error screen
            const failedStatus: PaymentStatus = {
              order_id: orderId,
              payment_status: 'FAILED',
              amount_tzs: 0,
              credits: 0,
              channel: '',
              reference: '',
              created_at: new Date().toISOString(),
              source: 'error'
            };
            
            if (isActive) {
              onStatusChange(failedStatus);
            }
          }
        }
      }
    };

    // Check immediately on mount
    checkPaymentStatus();

    // Then poll every 3 seconds
    pollInterval = setInterval(checkPaymentStatus, 3000);

    // Cleanup on unmount
    return () => {
      isActive = false;
      clearInterval(pollInterval);
      console.log('🧹 Payment polling cleaned up');
    };
  }, [orderId, onStatusChange]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Left Panel - Pure Black */}
      <div className="hidden md:flex md:w-2/5 lg:w-1/2 bg-black text-white flex-col justify-between p-8 lg:p-12">
        {/* Logo at Top */}
        <div>
          <img 
            src="/Vestis.svg" 
            alt="Vestis" 
            className="h-8 w-auto brightness-0 invert"
          />
        </div>

        {/* Credits Info - Centered */}
        <div>
          <p className="text-gray-500 text-sm uppercase tracking-wider mb-3">
            Processing Payment
          </p>
          <div className="flex items-baseline">
            <span className="text-5xl lg:text-6xl font-light tracking-tight">
              {expectedCredits.toLocaleString()}
            </span>
            <span className="text-2xl text-gray-600 ml-3">credits</span>
          </div>
          <p className="text-gray-600 text-sm mt-2">
            Your credits will be added automatically
          </p>
        </div>

        {/* Footer */}
        <div className="text-gray-600 text-xs">
          Secure payment powered by Vestis
        </div>
      </div>

      {/* Right Panel - Clean White */}
      <div className="w-full md:w-3/5 lg:w-1/2 bg-white flex flex-col relative">
        {/* Time Display - Top Right */}
        <div className="absolute top-8 right-8 lg:right-12">
          <span className="text-2xl font-mono font-semibold text-gray-900 tabular-nums">
            {formatTime(timeElapsed)}
          </span>
        </div>

        {/* Mobile Credits Summary - Only visible on mobile */}
        <div className="md:hidden mx-8 mt-8 mb-8 p-5 bg-black text-white rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="/Vestis.svg" 
              alt="Vestis" 
              className="h-6 w-auto brightness-0 invert"
            />
          </div>
          <p className="text-gray-500 text-xs uppercase tracking-wider">Processing Payment</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-light">
              {expectedCredits.toLocaleString()}
            </span>
            <span className="text-base text-gray-600">credits</span>
          </div>
        </div>

        {/* Centered Loading Animation */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="loader"></div>
          <div className="text-center space-y-2">
            <p className="text-lg font-normal text-gray-900">Processing payment</p>
            <p className="text-sm text-gray-500 font-light">Please wait</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PaymentSuccessProps {
  credits: number;
  amount: number;
  onClose: () => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ credits, amount, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Left Panel - Pure Black */}
      <div className="hidden md:flex md:w-2/5 lg:w-1/2 bg-black text-white flex-col justify-between p-8 lg:p-12">
        {/* Logo at Top */}
        <div>
          <img 
            src="/Vestis.svg" 
            alt="Vestis" 
            className="h-8 w-auto brightness-0 invert"
          />
        </div>

        {/* Success Info - Centered */}
        <div>
          <p className="text-green-500 text-sm uppercase tracking-wider mb-3">
            Payment Successful
          </p>
          <div className="flex items-baseline">
            <span className="text-5xl lg:text-6xl font-light tracking-tight">
              {credits.toLocaleString()}
            </span>
            <span className="text-2xl text-gray-600 ml-3">credits</span>
          </div>
          <p className="text-gray-600 text-sm mt-2">
            TZS {amount.toLocaleString()} · Added to your account
          </p>
        </div>

        {/* Footer */}
        <div className="text-gray-600 text-xs">
          Secure payment powered by Vestis
        </div>
      </div>

      {/* Right Panel - Clean White */}
      <div className="w-full md:w-3/5 lg:w-1/2 bg-white flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-24">
          <div className="max-w-md mx-auto w-full">
            {/* Mobile Success Summary - Only visible on mobile */}
            <div className="md:hidden mb-10 p-5 bg-black text-white rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/Vestis.svg" 
                  alt="Vestis" 
                  className="h-6 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-green-500 text-xs uppercase tracking-wider">Payment Successful</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-light">
                  {credits.toLocaleString()}
                </span>
                <span className="text-base text-gray-600">credits</span>
              </div>
              <p className="text-gray-600 text-xs mt-1">
                TZS {amount.toLocaleString()}
              </p>
            </div>

            {/* Success Icon */}
            <div className="flex justify-center mb-8">
              <CheckCircle2 className="h-20 w-20 text-green-600" strokeWidth={1.5} />
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-light text-gray-900 mb-2">Payment Successful!</h1>
              <p className="text-sm text-gray-600 font-light">
                Your credits have been added to your account
              </p>
            </div>

            {/* Details */}
            <div className="space-y-4 mb-8 p-6 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <span className="text-sm text-gray-600 font-light">Credits Added</span>
                <span className="text-lg font-semibold text-gray-900">{credits.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-light">Amount Paid</span>
                <span className="text-lg font-normal text-gray-900">
                  TZS {amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-black text-white rounded-lg font-normal hover:bg-gray-900 transition-all shadow-sm"
            >
              Continue
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 lg:px-24 border-t border-gray-100">
          <p className="text-center text-xs text-gray-500 font-light">
            Thank you for your purchase
          </p>
        </div>
      </div>
    </div>
  );
};

interface PaymentFailedProps {
  error: string;
  onRetry: () => void;
}

export const PaymentFailed: React.FC<PaymentFailedProps> = ({ error, onRetry }) => {
  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Left Panel - Pure Black */}
      <div className="hidden md:flex md:w-2/5 lg:w-1/2 bg-black text-white flex-col justify-between p-8 lg:p-12">
        {/* Logo at Top */}
        <div>
          <img 
            src="/Vestis.svg" 
            alt="Vestis" 
            className="h-8 w-auto brightness-0 invert"
          />
        </div>

        {/* Error Info - Centered */}
        <div>
          <p className="text-red-500 text-sm uppercase tracking-wider mb-3">
            Payment Failed
          </p>
          <div className="text-5xl lg:text-6xl font-light tracking-tight text-gray-600">
            Unsuccessful
          </div>
          <p className="text-gray-600 text-sm mt-2">
            Your payment could not be processed
          </p>
        </div>

        {/* Footer */}
        <div className="text-gray-600 text-xs">
          Secure payment powered by Vestis
        </div>
      </div>

      {/* Right Panel - Clean White */}
      <div className="w-full md:w-3/5 lg:w-1/2 bg-white flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-24">
          <div className="max-w-md mx-auto w-full">
            {/* Mobile Error Summary - Only visible on mobile */}
            <div className="md:hidden mb-10 p-5 bg-black text-white rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/Vestis.svg" 
                  alt="Vestis" 
                  className="h-6 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-red-500 text-xs uppercase tracking-wider">Payment Failed</p>
              <div className="text-2xl font-light text-gray-600 mt-1">
                Unsuccessful
              </div>
            </div>

            {/* Error Icon */}
            <div className="flex justify-center mb-8">
              <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center">
                <XCircle className="h-12 w-12 text-red-600" strokeWidth={1.5} />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-light text-gray-900 mb-2">Payment Failed</h1>
              <p className="text-sm text-gray-600 font-light">
                {error || 'Something went wrong with your payment'}
              </p>
            </div>

            {/* Possible reasons */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <p className="text-sm font-normal text-gray-900 mb-3">Possible reasons:</p>
              <ul className="text-sm text-gray-600 space-y-2 font-light">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>Insufficient balance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>Payment cancelled by user</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>Network connection issue</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>Invalid mobile money number</span>
                </li>
              </ul>
            </div>

            {/* Action Button */}
            <button
              onClick={onRetry}
              className="w-full py-3.5 bg-black text-white rounded-lg font-normal hover:bg-gray-900 transition-all shadow-sm"
            >
              Try Again
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 lg:px-24 border-t border-gray-100">
          <p className="text-center text-xs text-gray-500 font-light">
            Need help? Contact support
          </p>
        </div>
      </div>
    </div>
  );
};
