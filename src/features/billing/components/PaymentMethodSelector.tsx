'use client';

import React from 'react';
import { CreditCard, Smartphone } from 'lucide-react';

export type PaymentMethod = 'mobile_money' | 'card';

interface PaymentMethodSelectorProps {
    selectedMethod: PaymentMethod;
    onMethodChange: (method: PaymentMethod) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
    selectedMethod,
    onMethodChange,
}) => {
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Select payment method</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mobile Money Option */}
                <button
                    onClick={() => onMethodChange('mobile_money')}
                    className={`flex items-center gap-4 p-5 border-2 rounded-xl transition-all ${selectedMethod === 'mobile_money'
                            ? 'border-gray-900 bg-gray-50 shadow-lg'
                            : 'border-gray-200 hover:border-gray-400 hover:shadow-md bg-white'
                        }`}
                >
                    <div className={`p-3 rounded-lg ${selectedMethod === 'mobile_money' ? 'bg-gray-900' : 'bg-gray-100'
                        }`}>
                        <Smartphone className={`h-6 w-6 ${selectedMethod === 'mobile_money' ? 'text-white' : 'text-gray-600'
                            }`} />
                    </div>
                    <div className="text-left flex-1">
                        <span className={`text-base font-semibold block ${selectedMethod === 'mobile_money' ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                            Mobile Money
                        </span>
                        <span className="text-sm text-gray-500">M-Pesa, Tigo, Airtel</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <img src="/images/icons/vodacom.png" alt="M-Pesa" className="h-5 w-auto object-contain" />
                        <img src="/images/icons/tigo-seeklogo.png" alt="Tigo" className="h-5 w-auto object-contain" />
                        <img src="/images/icons/airtel-seeklogo.png" alt="Airtel" className="h-5 w-auto object-contain" />
                    </div>
                </button>

                {/* Card Payment Option */}
                <button
                    onClick={() => onMethodChange('card')}
                    className={`flex items-center gap-4 p-5 border-2 rounded-xl transition-all ${selectedMethod === 'card'
                            ? 'border-gray-900 bg-gray-50 shadow-lg'
                            : 'border-gray-200 hover:border-gray-400 hover:shadow-md bg-white'
                        }`}
                >
                    <div className={`p-3 rounded-lg ${selectedMethod === 'card' ? 'bg-gray-900' : 'bg-gray-100'
                        }`}>
                        <CreditCard className={`h-6 w-6 ${selectedMethod === 'card' ? 'text-white' : 'text-gray-600'
                            }`} />
                    </div>
                    <div className="text-left flex-1">
                        <span className={`text-base font-semibold block ${selectedMethod === 'card' ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                            Card Payment
                        </span>
                        <span className="text-sm text-gray-500">Visa, Mastercard</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <img src="/images/icons/visa.svg" alt="Visa" className="h-6 w-auto object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                        <img src="/images/icons/mastercard.svg" alt="Mastercard" className="h-6 w-auto object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                    </div>
                </button>
            </div>
        </div>
    );
};
