import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { PaymentStatus } from '../services/paymentService';

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

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] p-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        {/* Loading Animation */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
            <Clock className="h-6 w-6 text-gray-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Payment in Progress
        </h3>
        
        {/* Subtitle */}
        <p className="text-gray-600 text-center mb-6">
          Processing your payment...
        </p>

        {/* Instructions */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex-shrink-0 mt-0.5">
              <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                1
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Check your phone</p>
              <p className="text-xs text-gray-600 mt-1">
                You should receive an USSD prompt on your mobile money number
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex-shrink-0 mt-0.5">
              <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                2
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Enter your PIN</p>
              <p className="text-xs text-gray-600 mt-1">
                Enter your mobile money PIN to authorize the payment
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex-shrink-0 mt-0.5">
              <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                3
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Credits added automatically</p>
              <p className="text-xs text-gray-600 mt-1">
                Your {expectedCredits} credits will be added once payment is confirmed
              </p>
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Order ID:</span>
            <span className="text-gray-900 font-mono text-xs">{orderId.slice(0, 20)}...</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Time elapsed:</span>
            <span className="text-gray-900 font-medium">{formatTime(timeElapsed)}</span>
          </div>
        </div>

        {/* Waiting message */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            This usually takes 30-60 seconds. Please don't close this page.
          </p>
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
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] p-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Payment Successful!
        </h3>
        
        {/* Message */}
        <p className="text-gray-600 text-center mb-6">
          Your credits have been added to your account
        </p>

        {/* Details */}
        <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Credits Added:</span>
            <span className="text-2xl font-bold text-gray-900">{credits}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Amount Paid:</span>
            <span className="text-lg font-semibold text-gray-900">
              TZS {amount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-md"
        >
          Continue
        </button>
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
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] p-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Payment Failed
        </h3>
        
        {/* Error Message */}
        <p className="text-gray-600 text-center mb-6">
          {error || 'Something went wrong with your payment'}
        </p>

        {/* Possible reasons */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">Possible reasons:</p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Insufficient balance</li>
            <li>Payment cancelled by user</li>
            <li>Network connection issue</li>
            <li>Invalid mobile money number</li>
          </ul>
        </div>

        {/* Action Button */}
        <button
          onClick={onRetry}
          className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-md"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};
