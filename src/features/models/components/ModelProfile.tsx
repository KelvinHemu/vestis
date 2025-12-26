"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useModel } from '@/hooks/useModels';
import modelService from '@/services/modelService';
import type { ModelImage } from '@/types/model';

/* ============================================
   ModelProfile Component
   Dedicated model profile page with gallery
   Receives modelId as prop from page component
   ============================================ */

interface ModelProfileProps {
  modelId?: string;
}

export function ModelProfile({ modelId }: ModelProfileProps) {
  const router = useRouter();

  // State for image navigation
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch model using React Query (cached)
  const { data: model, isLoading, error } = useModel(modelId);

  // Get images for gallery
  // We filter out the main profile image (position 2) to focus on editorial shots,
  // unless it's the only image available.
  const allImages = model ? (() => {
    // Handle case where model has no images
    if (!model.images || !Array.isArray(model.images) || model.images.length === 0) {
      return [];
    }

    const galleryImages = model.images.filter((img: ModelImage) => img.position !== 2);
    const imagesToShow = galleryImages.length > 0 ? galleryImages : model.images;

    return imagesToShow
      .sort((a: ModelImage, b: ModelImage) => a.position - b.position)
      .map((img: ModelImage) => img.url);
  })() : [];

  // Navigation handlers
  const nextImage = () => {
    if (allImages.length <= 2) return;
    setCurrentImageIndex(prev => (prev + 2) % allImages.length);
  };

  const prevImage = () => {
    if (allImages.length <= 2) return;
    setCurrentImageIndex(prev => {
      const newIndex = prev - 2;
      return newIndex < 0 ? allImages.length + newIndex : newIndex;
    });
  };

  // Reset image index when model changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [model]);

  // ============================================================================
  // Loading State
  // ============================================================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm tracking-widest uppercase">Loading model...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Error State
  // ============================================================================
  if (error || !model) {
    const errorMessage = error instanceof Error ? error.message : 'Model not found';
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center max-w-md px-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-widest">{errorMessage}</h3>
          <p className="text-gray-500 mb-6">The model you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <button
            onClick={() => router.push('/models')}
            className="px-6 py-3 bg-black text-white text-sm font-medium tracking-widest uppercase hover:bg-gray-800 transition-colors"
          >
            Browse All Models
          </button>
        </div>
      </div>
    );
  }

  // Get current pair of images to display
  const firstImage = allImages[currentImageIndex];
  const secondImageIndex = (currentImageIndex + 1) % allImages.length;
  const secondImage = allImages.length > 1 ? allImages[secondImageIndex] : null;

  // ============================================================================
  // No Images State
  // ============================================================================
  if (allImages.length === 0) {
    return (
      <div className="min-h-screen bg-white text-gray-900 font-sans">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
          <div className="flex items-center justify-center mb-8 relative">
            <button
              onClick={() => router.push('/models')}
              className="absolute left-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Back to models"
            >
              <ArrowLeft className="w-6 h-6 text-gray-900" />
            </button>

            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold tracking-widest uppercase mb-3">
                {model.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md px-6">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-widest">No Images Available</h3>
              <p className="text-gray-500 mb-6">This model&apos;s portfolio is currently being updated. Please check back soon.</p>
              <button
                onClick={() => router.push('/models')}
                className="px-6 py-3 bg-black text-white text-sm font-medium tracking-widest uppercase hover:bg-gray-800 transition-colors"
              >
                Browse Other Models
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Header with Back Button and Name on Same Row */}
        <div className="flex items-center justify-center mb-8 relative">
          <button
            onClick={() => router.push('/models')}
            className="absolute left-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Back to models"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>

          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold tracking-widest uppercase mb-3">
              {model.name}
            </h1>

            <div className="flex flex-wrap justify-center items-center gap-x-2 text-xs font-medium tracking-widest uppercase">
              <span className="text-black font-bold">Portfolio</span>
              <span className="text-gray-400">|</span>
              <a href="#" className="text-gray-500 hover:text-black transition-colors">Instagram</a>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-12 items-start relative justify-center">

          {/* Left Sidebar - Stats */}
          <div className="lg:w-48 flex-shrink-0 lg:sticky lg:top-32">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 lg:block lg:space-y-4 text-xs tracking-widest uppercase">
              <div>
                <span className="block font-bold text-gray-900 mb-1">Gender</span>
                <span className="text-gray-500">{model.gender}</span>
              </div>
              <div>
                <span className="block font-bold text-gray-900 mb-1">Age</span>
                <span className="text-gray-500">{modelService.formatAgeRange(model.age_range)}</span>
              </div>
              {/* Placeholder stats */}
              <div>
                <span className="block font-bold text-gray-900 mb-1">Height</span>
                <span className="text-gray-400">175 cm</span>
              </div>
              <div>
                <span className="block font-bold text-gray-900 mb-1">Eyes</span>
                <span className="text-gray-400">Brown</span>
              </div>
              <div>
                <span className="block font-bold text-gray-900 mb-1">Hair</span>
                <span className="text-gray-400">Dark Brown</span>
              </div>
            </div>
          </div>

          {/* Center - Images */}
          <div className="flex-1 relative group max-w-4xl">
            {/* Navigation Arrows */}
            {allImages.length > 2 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute -left-12 md:-left-16 top-1/2 -translate-y-1/2 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors opacity-100"
                >
                  <ChevronLeft className="w-8 h-8 text-gray-900" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute -right-12 md:-right-16 top-1/2 -translate-y-1/2 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors opacity-100"
                >
                  <ChevronRight className="w-8 h-8 text-gray-900" />
                </button>
              </>
            )}

            <div className={`grid ${secondImage ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-md mx-auto'} gap-0`}>
              {/* Image 1 */}
              <div className="bg-gray-100 relative overflow-hidden h-full">
                <img
                  src={firstImage}
                  alt={`${model.name} 1`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Image 2 */}
              {secondImage && (
                <div className="bg-gray-100 relative overflow-hidden h-full">
                  <img
                    src={secondImage}
                    alt={`${model.name} 2`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Pagination Dots */}
            {allImages.length > 2 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: Math.ceil(allImages.length / 2) }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx * 2)}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${Math.floor(currentImageIndex / 2) === idx ? 'bg-black' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Spacer to balance layout */}
          <div className="hidden lg:block lg:w-12 flex-shrink-0"></div>
        </div>
      </div>
    </div>
  );
}
