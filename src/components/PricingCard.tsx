import React from 'react';
import { Check, Zap } from 'lucide-react';
import type { CreditPackage } from '../services/paymentService';

interface PricingCardProps {
  package: CreditPackage;
  isSelected: boolean;
  onSelect: () => void;
  onUpgrade: () => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({ package: pkg, isSelected, onSelect, onUpgrade }) => {
  return (
    <div
      onClick={onSelect}
      className={`
        relative p-5 rounded-xl border-2 transition-all cursor-pointer
        ${isSelected 
          ? 'border-gray-900 bg-gray-50 shadow-xl scale-[1.02]' 
          : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-md'
        }
        ${pkg.recommended ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
      `}
    >
      {/* Recommended Badge */}
      {pkg.recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-full shadow-md uppercase tracking-wide">
            Popular
          </span>
        </div>
      )}

      {/* Savings Badge */}
      {pkg.savings > 0 && !pkg.recommended && (
        <div className="absolute -top-3 -right-3">
          <span className="inline-flex px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-md">
            Save {pkg.savings}%
          </span>
        </div>
      )}

      {/* Package Name */}
      <div className="mb-1.5">
        <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">{pkg.name}</h3>
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold text-gray-900">
            TZS {pkg.price_tzs.toLocaleString()}
          </span>
        </div>
        <div className="text-xs text-gray-600 mt-0.5">
          ${pkg.price_usd.toFixed(2)} USD/month
        </div>
      </div>

      {/* Upgrade Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onUpgrade();
        }}
        className="w-full py-2.5 px-3 rounded-lg text-sm font-semibold transition-all mb-4 bg-gray-900 text-white hover:bg-gray-800 shadow-lg"
      >
        Upgrade to {pkg.name}
      </button>

      {/* Credits Badge */}
      <div className="flex items-center justify-center gap-1.5 mb-4 pb-4 border-b border-gray-200">
        <Zap className="h-4 w-4 text-gray-900" />
        <span className="text-sm font-bold text-gray-900">{pkg.credits.toLocaleString()} credits</span>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-xs text-gray-900 font-medium">
              Increased access to generation
            </span>
            <p className="text-[10px] text-gray-600 mt-0.5">
              Improved quality and capabilities
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-gray-900 font-medium">
            Extended memory <span className="text-gray-600">{pkg.credits.toLocaleString()} credits</span>
          </span>
        </div>
        
        <div className="flex items-start gap-2">
          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-gray-900 font-medium">
            Access to all styles & tools
          </span>
        </div>
        
        <div className="flex items-start gap-2">
          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-gray-900 font-medium">
            Private Generation
          </span>
        </div>
        
        <div className="flex items-start gap-2">
          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-gray-900 font-medium">
            Priority generation
          </span>
        </div>
        
        <div className="flex items-start gap-2">
          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-gray-900 font-medium">
            Storage for 60 days
          </span>
        </div>
        
        <div className="flex items-start gap-2">
          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-gray-900 font-medium">
            No watermark
          </span>
        </div>
        
        <div className="flex items-start gap-2">
          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-gray-900 font-medium">
            No ads
          </span>
        </div>
      </div>
    </div>
  );
};
