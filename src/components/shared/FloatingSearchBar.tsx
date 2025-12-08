"use client";

import React, { useState } from 'react';
import { Search, Filter, SlidersHorizontal, Sparkles } from 'lucide-react';

interface FloatingSearchBarProps {
  onSearch?: (query: string) => void;
  onFilterClick?: () => void;
}

export const FloatingSearchBar: React.FC<FloatingSearchBarProps> = ({ 
  onSearch,
  onFilterClick 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <div className="sticky top-0 z-40 mb-8">
      <div className={`
        bg-white rounded-2xl shadow-lg border border-gray-200 
        transition-all duration-300 
        ${isFocused ? 'shadow-xl ring-2 ring-gray-900/10' : ''}
      `}>
        <form onSubmit={handleSearch} className="flex items-center gap-3 p-3">
          {/* Search Icon */}
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100">
            <Search className="w-5 h-5 text-gray-600" />
          </div>

          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search features, templates, or start creating..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-sm font-medium"
          />

          {/* AI Suggestions Button */}
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium text-sm hover:shadow-md transition-all duration-200 hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">AI Suggest</span>
          </button>

          {/* Advanced Filters Button */}
          <button
            type="button"
            onClick={onFilterClick}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            title="Advanced Filters"
          >
            <SlidersHorizontal className="w-5 h-5 text-gray-600" />
          </button>

          {/* Filter Button */}
          <button
            type="button"
            onClick={onFilterClick}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            title="Filters"
          >
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </form>

        {/* Quick Actions / Suggestions Bar */}
        {isFocused && (
          <div className="border-t border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 font-medium">Quick Actions:</span>
              {['Generate On-Model', 'Create Flat-Lay', 'Virtual Try-On', 'Batch Process'].map((action) => (
                <button
                  key={action}
                  type="button"
                  className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
