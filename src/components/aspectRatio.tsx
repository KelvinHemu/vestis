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
  { value: 'auto', label: 'Auto' },
  { value: '1:1', label: '1:1' },
  { value: '2:3', label: '2:3' },
  { value: '3:2', label: '3:2' },
  { value: '3:4', label: '3:4' },
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
    <div className={`space-y-2.5 ${className}`}>
      <Label htmlFor="aspect-ratio" className="text-sm font-semibold text-gray-900">
        {label}
      </Label>
      <div className="relative">
        <Select value={value} onValueChange={onValueChange} onOpenChange={setIsOpen}>
          <SelectTrigger 
            id="aspect-ratio" 
            className="w-full h-11 bg-white border-gray-300 hover:border-gray-400 focus:border-gray-400 focus:ring-0 focus:ring-offset-0 transition-colors rounded-xl [&>svg]:hidden"
          >
            <SelectValue placeholder="Select aspect ratio" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] rounded-xl">
            {aspectRatioOptions.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100 rounded-lg"
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
