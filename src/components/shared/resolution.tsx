"use client";

import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ChevronDown } from 'lucide-react';

export type ResolutionValue = '1K' | '2K' | '4K';

interface ResolutionProps {
  value: ResolutionValue;
  onValueChange: (value: ResolutionValue) => void;
  label?: string;
  className?: string;
}

const resolutionOptions: { value: ResolutionValue; label: string }[] = [
  { value: '1K', label: '1K' },
  { value: '2K', label: '2K' },
  { value: '4K', label: '4K' },
];

const Resolution: React.FC<ResolutionProps> = ({
  value,
  onValueChange,
  label = 'Resolution',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`space-y-1.5 md:space-y-2.5 ${className}`}>
      <Label htmlFor="resolution" className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white">
        {label}
      </Label>
      <div className="relative">
        <Select value={value} onValueChange={onValueChange} onOpenChange={setIsOpen}>
          <SelectTrigger 
            id="resolution" 
            className="w-full h-9 md:h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:border-gray-400 dark:focus:border-gray-500 focus:ring-0 focus:ring-offset-0 transition-colors rounded-xl [&>svg]:hidden text-gray-900 dark:text-white text-sm"
          >
            <SelectValue placeholder="Select resolution" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            {resolutionOptions.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
              >
                <span className="font-medium">{option.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ChevronDown 
          className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 transition-transform duration-200 pointer-events-none ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>
    </div>
  );
};

export default Resolution;
