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

export type AspectRatioValue = 'auto' | '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '9:16' | '16:9' | '21:9';

interface AspectRatioProps {
  value: AspectRatioValue;
  onValueChange: (value: AspectRatioValue) => void;
  label?: string;
  className?: string;
}

const aspectRatioOptions: { value: AspectRatioValue; label: string }[] = [
  { value: '3:4', label: '3:4' },
  { value: '1:1', label: '1:1' },
  { value: '2:3', label: '2:3' },
  { value: '3:2', label: '3:2' },
  { value: '4:3', label: '4:3' },
  { value: '4:5', label: '4:5' },
  { value: '5:4', label: '5:4' },
  { value: '9:16', label: '9:16' },
  { value: '16:9', label: '16:9' },
  { value: '21:9', label: '21:9' },
];

const AspectRatio: React.FC<AspectRatioProps> = ({
  value,
  onValueChange,
  label = 'Aspect Ratio',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`space-y-1.5 md:space-y-2.5 ${className}`}>
      <Label htmlFor="aspect-ratio" className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white">
        {label}
      </Label>
      <div className="relative">
        <Select value={value} onValueChange={onValueChange} onOpenChange={setIsOpen}>
          <SelectTrigger 
            id="aspect-ratio" 
            className="w-full h-9 md:h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:border-gray-400 dark:focus:border-gray-500 focus:ring-0 focus:ring-offset-0 transition-colors rounded-xl [&>svg]:hidden text-gray-900 dark:text-white text-sm"
          >
            <SelectValue placeholder="Select aspect ratio" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            {aspectRatioOptions.map((option) => (
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

export default AspectRatio;
