"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  className?: string;
}

export function CustomDropdown({ value, options, onChange, className = '' }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 dark:bg-secondary rounded-lg text-gray-700 dark:text-foreground font-medium text-sm hover:bg-gray-100 dark:hover:bg-accent transition-colors"
      >
        <span>{selectedOption?.label || 'Select'}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-secondary rounded-lg shadow-lg border border-gray-200 dark:border-border py-1 z-50">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full px-3 py-2 text-left text-gray-700 dark:text-foreground text-sm hover:bg-gray-50 dark:hover:bg-accent transition-colors ${option.value === value ? 'bg-gray-50 dark:bg-accent font-medium' : ''
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
