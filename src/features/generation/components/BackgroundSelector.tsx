"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ImageIcon } from 'lucide-react';
import { getBackgrounds } from '@/services/backgroundService';
import { useCustomBackgroundsList } from '@/hooks/useCustomBackgrounds';
import type { Background, BackgroundCategory } from '@/types/background';

// ============================================================================
// Props Interface
// ============================================================================

interface BackgroundSelectorProps {
  selectedBackground?: number | string;
  onBackgroundSelect: (backgroundId: number | string) => void;
}

// ============================================================================
// Category Configuration
// ============================================================================

const categories: Array<{ id: BackgroundCategory; label: string }> = [
  { id: 'Indoor', label: 'Indoor' },
  { id: 'Outdoor', label: 'Outdoor' },
  { id: 'studio', label: 'Studio' },
];

// ============================================================================
// BackgroundSelector Component
// ============================================================================

export function BackgroundSelector({
  selectedBackground,
  onBackgroundSelect
}: BackgroundSelectorProps) {
  const router = useRouter();
  
  // Category filter state for system backgrounds
  const [activeCategory, setActiveCategory] = useState<BackgroundCategory>('Indoor');
  
  // System backgrounds state
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch custom backgrounds using the hook
  const { data: customBackgrounds, isLoading: isLoadingCustom } = useCustomBackgroundsList();

  // ============================================================================
  // Fetch system backgrounds from API
  // ============================================================================
  
  useEffect(() => {
    const fetchBackgrounds = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getBackgrounds();
        console.log('Backgrounds API Response:', response);
        console.log('Filtered active backgrounds:', response.backgrounds.filter(bg => bg.status === 'active'));
        setBackgrounds(response.backgrounds.filter(bg => bg.status === 'active'));
      } catch (err) {
        setError('Failed to load backgrounds. Please try again.');
        console.error('Error fetching backgrounds:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBackgrounds();
  }, []);

  // Filter system backgrounds by selected category
  const filteredBackgrounds = backgrounds.filter(bg => bg.category === activeCategory);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleBackgroundClick = (backgroundId: number) => {
    onBackgroundSelect(backgroundId);
  };

  // Custom backgrounds use string IDs prefixed with 'custom-'
  const handleCustomBackgroundClick = (backgroundId: number) => {
    onBackgroundSelect(`custom-${backgroundId}`);
  };

  // Check if a custom background is selected
  const isCustomBackgroundSelected = (backgroundId: number) => {
    return selectedBackground === `custom-${backgroundId}`;
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-12rem)]">
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 -mr-2 scrollbar-hide">
        
        {/* Header Section */}
        <div className="space-y-4 pb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Select Background</h2>
          <p className="text-gray-600 dark:text-gray-400">Choose a background style for your on-model photo</p>
        </div>

        {/* ================================================================== */}
        {/* My Backgrounds Section - User's Custom Backgrounds */}
        {/* ================================================================== */}
        
        <div className="mb-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">My Backgrounds</h3>
              {customBackgrounds && customBackgrounds.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({customBackgrounds.length})
                </span>
              )}
            </div>
            
            {/* Add Background Button */}
            <button
              onClick={() => router.push('/add-background')}
              className="flex items-center gap-1 py-1 px-2 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>

          {/* Loading State for Custom Backgrounds */}
          {isLoadingCustom && (
            <div className="flex gap-2">
              {[1, 2].map((i) => (
                <div key={i} className="w-24 h-28 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {/* Custom Backgrounds Grid */}
          {!isLoadingCustom && customBackgrounds && customBackgrounds.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
              {customBackgrounds.map((background) => (
                <button
                  key={`custom-${background.id}`}
                  onClick={() => handleCustomBackgroundClick(background.id)}
                  className={`relative rounded-lg overflow-hidden transition-all transform-gpu ${
                    isCustomBackgroundSelected(background.id)
                      ? 'ring-2 sm:ring-4 ring-black dark:ring-white ring-offset-1 sm:ring-offset-2'
                      : 'ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-2 hover:ring-gray-400 dark:hover:ring-gray-500'
                  }`}
                >
                  {/* Image Container */}
                  <div className="w-full relative transform-gpu" style={{ aspectRatio: '4/5' }}>
                    <img
                      src={background.url}
                      alt={background.name}
                      className="w-full h-full object-cover transform-gpu"
                      loading="lazy"
                      decoding="async"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity pointer-events-none" />
                  </div>

                  {/* Name Label */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 py-1 px-1.5 z-10">
                    <p className="text-xs font-medium text-gray-900 dark:text-white text-center truncate">
                      {background.name}
                    </p>
                  </div>

                  {/* Selected Checkmark */}
                  {isCustomBackgroundSelected(background.id) && (
                    <div className="absolute top-1 right-1 bg-black dark:bg-white rounded-full p-0.5 z-10">
                      <svg
                        className="w-3 h-3 text-white dark:text-black"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Empty State for Custom Backgrounds */}
          {!isLoadingCustom && (!customBackgrounds || customBackgrounds.length === 0) && (
            <button
              onClick={() => router.push('/add-background')}
              className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
            >
              <div className="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400">
                <Plus className="w-5 h-5" />
                <span className="text-xs font-medium">Add your first background</span>
              </div>
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 mb-4" />

        {/* ================================================================== */}
        {/* System Backgrounds Section */}
        {/* ================================================================== */}

        {/* Sticky Category Tabs - Sticks to top when scrolling */}
        <div className="sticky top-0 bg-white dark:bg-[#1A1A1A] z-10 pb-4 pt-2 -mt-2">
          <div className="flex justify-between items-center gap-3">
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`py-1.5 px-3 rounded text-xs font-medium transition-all ${activeCategory === category.id
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
            {selectedBackground && (
              <button
                onClick={() => onBackgroundSelect('')}
                className="py-1.5 px-4 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* System Backgrounds Content */}
        <div>
          {loading ? (
            <div className="text-center py-12 pt-4 pl-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 dark:border-gray-600 border-t-black dark:border-t-white"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-4">Loading backgrounds...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 pt-4 pl-4 text-red-500 dark:text-red-400">
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded hover:bg-gray-800 dark:hover:bg-gray-100"
              >
                Retry
              </button>
            </div>
          ) : filteredBackgrounds.length === 0 ? (
            <div className="text-center py-12 pt-4 pl-4 text-gray-500 dark:text-gray-400">
              <p>No backgrounds available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 pt-4 pl-0 sm:pl-4 pb-4">
              {filteredBackgrounds.map((background) => {
                console.log('Rendering background:', background.name, 'Image URL:', background.url);
                return (
                  <button
                    key={background.id}
                    onClick={() => handleBackgroundClick(background.id)}
                    className={`relative rounded-lg overflow-hidden transition-all transform-gpu ${selectedBackground === background.id
                        ? 'ring-2 sm:ring-4 ring-black dark:ring-white ring-offset-1 sm:ring-offset-2'
                        : 'ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-2 hover:ring-gray-400 dark:hover:ring-gray-500'
                      }`}
                  >
                    {/* Image Container */}
                    <div className="w-full relative transform-gpu" style={{ aspectRatio: '4/5' }}>
                      <img
                        src={background.url}
                        alt={background.alt_text || background.name}
                        className="w-full h-full object-cover transform-gpu"
                        loading="lazy"
                        decoding="async"
                        onLoad={() => console.log('Image loaded:', background.name)}
                        onError={(e) => {
                          console.error('Image failed to load:', background.name, background.url);
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                        }}
                      />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity pointer-events-none" />
                    </div>

                    {/* Name Label */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 py-1 sm:py-2 px-1.5 sm:px-3 z-10">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white text-center truncate">
                        {background.name}
                      </p>
                    </div>

                    {/* Selected Checkmark */}
                    {selectedBackground === background.id && (
                      <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-black dark:bg-white rounded-full p-0.5 sm:p-1 z-10">
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 text-white dark:text-black"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
