import React from 'react';
import { Check, X } from 'lucide-react';

interface FreePlanCardProps {
  currentCredits: number;
  isCurrentPlan?: boolean;
}

export const FreePlanCard: React.FC<FreePlanCardProps> = ({ currentCredits, isCurrentPlan = true }) => {
  return (
    <div className="relative p-6 rounded-2xl border-2 border-gray-200 bg-white">
      {/* Plan Label */}
      <div className="mb-2">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Free Plan</h3>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="text-5xl font-bold text-gray-900 mb-1">Free</div>
      </div>

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <button
          disabled
          className="w-full py-3 px-4 mb-6 rounded-xl font-semibold bg-gray-100 text-gray-600 cursor-not-allowed"
        >
          Current Plan
        </button>
      )}

      {/* Features List */}
      <div className="space-y-3">
        {/* Limited Features */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <Check className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <span className="text-sm text-gray-900 font-medium">Limited access to generation</span>
            <p className="text-xs text-gray-600 mt-0.5">Basic features only</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <Check className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <span className="text-sm text-gray-900 font-medium">Limited credits</span>
            <p className="text-xs text-gray-600 mt-0.5">{currentCredits} credits available</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <Check className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <span className="text-sm text-gray-900 font-medium">Access to limited styles & tools</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <Check className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <span className="text-sm text-gray-900 font-medium">Storage for 30 days</span>
          </div>
        </div>

        {/* Not Included Features */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-start gap-3 opacity-60">
            <div className="flex-shrink-0 mt-0.5">
              <X className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex-1">
              <span className="text-sm text-gray-600">Priority generation</span>
            </div>
          </div>

          <div className="flex items-start gap-3 opacity-60 mt-3">
            <div className="flex-shrink-0 mt-0.5">
              <X className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex-1">
              <span className="text-sm text-gray-600">Private generation</span>
            </div>
          </div>

          <div className="flex items-start gap-3 opacity-60 mt-3">
            <div className="flex-shrink-0 mt-0.5">
              <X className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex-1">
              <span className="text-sm text-gray-600">Extended storage (60 days)</span>
            </div>
          </div>

          <div className="flex items-start gap-3 opacity-60 mt-3">
            <div className="flex-shrink-0 mt-0.5">
              <X className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex-1">
              <span className="text-sm text-gray-600">No watermark</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
