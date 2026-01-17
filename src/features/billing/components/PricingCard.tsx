import React from 'react';
import { Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { CreditPackage } from '@/services/paymentService';

interface PricingCardProps {
  package: CreditPackage;
  isSelected: boolean;
  onSelect: () => void;
  onUpgrade: () => void;
}

// Map package names to their features
const getPackageFeatures = (packageName: string): string[] => {
  const name = packageName.toLowerCase();
  
  if (name.includes('seller') || name.includes('basic')) {
    return [
      '~200 image generations / month',
      'No watermark',
      'Commercial usage rights',
      'Faster processing speed',
      'Secure cloud storage',
      'Email support',
    ];
  }
  
  if (name.includes('growth') || name.includes('pro')) {
    return [
      '~1,000 image generations / month',
      'Priority processing',
      'Priority cloud storage',
      'Batch uploads',
      'Email + chat support',
      'Perfect for high content velocity',
    ];
  }
  
  if (name.includes('business') || name.includes('enterprise')) {
    return [
      '3,000+ image generations / month',
      'Highest processing priority',
      'Unlimited cloud storage',
      'Dedicated account support',
      'API access (coming soon)',
      'White-label options',
    ];
  }
  
  // Default features
  return [
    'Image generations included',
    'No watermark',
    'Commercial usage rights',
    'Cloud storage',
    'Email support',
  ];
};

// Get description based on package name
const getPackageDescription = (packageName: string): string => {
  const name = packageName.toLowerCase();
  
  if (name.includes('seller') || name.includes('basic')) {
    return 'For sellers ready to sell professionally online.';
  }
  if (name.includes('growth') || name.includes('pro')) {
    return 'For serious sellers and growing fashion brands.';
  }
  if (name.includes('business') || name.includes('enterprise')) {
    return 'For agencies, marketplaces, and high-volume fashion sellers.';
  }
  return 'Professional image generation for your business.';
};

// Check if package is business/enterprise tier
const isBusinessPlan = (packageName: string): boolean => {
  const name = packageName.toLowerCase();
  return name.includes('business') || name.includes('enterprise');
};

// Calendly link for sales (from environment variable)
const CALENDLY_LINK = process.env.NEXT_PUBLIC_CALENDLY_LINK || 'https://cal.com/Kelvin-hemu/15min';

export const PricingCard: React.FC<PricingCardProps> = ({ package: pkg, isSelected, onSelect, onUpgrade }) => {
  const features = getPackageFeatures(pkg.name);
  const description = getPackageDescription(pkg.name);
  const isBusiness = isBusinessPlan(pkg.name);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBusiness) {
      // Open Calendly for business plan
      window.open(CALENDLY_LINK, '_blank');
    } else {
      onUpgrade();
    }
  };

  return (
    <Card 
      onClick={onSelect}
      className={`
        relative cursor-pointer transition-all bg-white dark:bg-gray-900
        ${isSelected ? 'scale-[1.02] ring-2 ring-primary' : 'hover:shadow-md'}
        ${pkg.recommended ? 'border-2 border-primary shadow-lg shadow-primary/10' : 'border border-gray-200 dark:border-gray-700'}
      `}
    >
      {/* Most Popular Badge */}
      {pkg.recommended && (
        <span className="bg-primary absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full px-3 py-1 text-xs font-medium text-primary-foreground ring-1 ring-inset ring-white/20">
          Most Popular
        </span>
      )}

      {/* Savings Badge */}
      {pkg.savings > 0 && !pkg.recommended && (
        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
          Save {pkg.savings}%
        </span>
      )}

      <CardHeader>
        <CardTitle className="font-medium text-gray-900 dark:text-white">{pkg.name}</CardTitle>
        <span className="my-3 block text-3xl font-bold text-gray-900 dark:text-white">
          {isBusiness ? 'Custom' : `${pkg.price_tzs.toLocaleString()} TZS`} <span className="text-base font-normal text-gray-500 dark:text-gray-400">{isBusiness ? 'pricing' : '/ mo'}</span>
        </span>
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </CardDescription>
        <Button
          onClick={handleButtonClick}
          variant={pkg.recommended ? 'default' : 'outline'}
          className={`mt-4 w-full ${
            pkg.recommended ? '!bg-blue-500 !text-white hover:!bg-blue-600' : ''
          }`}
        >
          {isBusiness ? 'Contact Sales' : `Upgrade to ${pkg.name}`}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <hr className="border-dashed border-gray-200 dark:border-gray-700" />
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
          What&apos;s included
        </p>
        <ul className="list-outside space-y-3 text-sm">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Check className="size-3 text-primary shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
