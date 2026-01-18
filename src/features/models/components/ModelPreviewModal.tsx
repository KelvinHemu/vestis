"use client";

import { useState } from 'react';
import { X, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Model } from '@/types/model';
import modelService from '@/services/modelService';

// ============================================================================
// ModelPreviewModal Component - Fullscreen modal with image gallery and info
// ============================================================================

interface ModelPreviewModalProps {
  model: Model;
  isOpen: boolean;
  isFavorite?: boolean;
  onClose: () => void;
  onFavorite?: () => void;
  onSelect?: () => void;
}

export function ModelPreviewModal({
  model,
  isOpen,
  isFavorite = false,
  onClose,
  onFavorite,
  onSelect
}: ModelPreviewModalProps) {
  // Get all images sorted by position
  const allImages = modelService.getAllImages(model);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft') {
      setActiveImageIndex(prev => (prev > 0 ? prev - 1 : allImages.length - 1));
    } else if (e.key === 'ArrowRight') {
      setActiveImageIndex(prev => (prev < allImages.length - 1 ? prev + 1 : 0));
    }
  };

  // Navigate to previous image
  const goToPrevious = () => {
    setActiveImageIndex(prev => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  // Navigate to next image
  const goToNext = () => {
    setActiveImageIndex(prev => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  if (!isOpen) return null;

  const ageRange = modelService.formatAgeRange(model.age_range);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Favorite Button */}
        <button
          onClick={onFavorite}
          className="absolute top-4 left-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Main Image Section */}
        <div className="relative aspect-[4/5] bg-gray-100 dark:bg-gray-800">
          {allImages.length > 0 ? (
            <img
              src={allImages[activeImageIndex]}
              alt={`${model.name} - Image ${activeImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}

          {/* Navigation Arrows - Only show if multiple images */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
              {activeImageIndex + 1} / {allImages.length}
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {allImages.length > 1 && (
          <div className="flex gap-2 p-3 bg-gray-50 dark:bg-gray-800 overflow-x-auto">
            {allImages.map((imageUrl, index) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                  index === activeImageIndex
                    ? 'ring-2 ring-black dark:ring-white ring-offset-2 dark:ring-offset-gray-800'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={imageUrl}
                  alt={`${model.name} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Model Info Section */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{model.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{model.gender} Model</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600">
                Age: {ageRange}
              </span>
            </div>
          </div>

          {/* Select Button */}
          {onSelect && (
            <button
              onClick={() => {
                onSelect();
                onClose();
              }}
              className="w-full py-3 px-4 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Select This Model
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
