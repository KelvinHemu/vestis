"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Download, Share2 } from 'lucide-react';
import { FeatureCard, features } from '@/components/shared/FeatureCard';
import { FloatingAskBar } from './FloatingAskBar';
import { UploadedImagesGrid } from './UploadedImagesGrid';
import { GeneratingShimmer } from './GeneratingShimmer';
import { EditHistoryThumbnails } from './EditHistoryThumbnails';
import { InsufficientCreditsDialog } from '@/components/ui/InsufficientCreditsDialog';
import { FullscreenImageViewer } from '@/components/ui/FullscreenImageViewer';
import { chatService } from '@/services/chatService';
import { InsufficientCreditsError } from '@/types/errors';
import { USER_QUERY_KEY } from '@/hooks/useUser';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';

interface UploadedImage {
  id: string;
  url: string;
  name: string;
}

export const CreatePage: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);
  const [showInsufficientCreditsDialog, setShowInsufficientCreditsDialog] = useState(false);
  const [creditsInfo, setCreditsInfo] = useState({ available: 0, required: 1 });
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [revealComplete, setRevealComplete] = useState(!!generatedImage);
  const preEditUrlRef = useRef<string | null>(null);

  // Detect mobile keyboard visibility for proper input positioning
  const { isKeyboardVisible, keyboardHeight, barRef } = useKeyboardVisible();

  // Combined: input is focused OR keyboard is actually visible
  const isTyping = isInputFocused || isKeyboardVisible;

  // Query client for invalidating user credits after generation
  const queryClient = useQueryClient();

  // Check for image from history on mount
  React.useEffect(() => {
    const editImage = sessionStorage.getItem('editImage');
    if (editImage) {
      setGeneratedImage(editImage);
      setIsEditMode(true);
      sessionStorage.removeItem('editImage'); // Clean up
    }
  }, []);

  // Reset reveal state when generation starts and capture the current URL
  useEffect(() => {
    if (isGenerating) {
      preEditUrlRef.current = generatedImage;
      setRevealComplete(false);
    }
  }, [isGenerating]);

  const handleFilesSelected = (files: File[]) => {
    const newImages: UploadedImage[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setUploadedImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveImage = (id: string) => {
    setUploadedImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);
      if (imageToRemove) {
        // Revoke the object URL to free up memory
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleChatSubmit = async (prompt: string, images: string[]) => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log('🎨 Starting generation with prompt:', prompt);
      console.log('🔄 Edit mode:', isEditMode);

      // If in edit mode, include the current generated image
      const imagesToSend = isEditMode && generatedImage
        ? [generatedImage, ...images]
        : images;

      const response = await chatService.generate({
        prompt,
        images: imagesToSend,
      });

      if (response.success && response.imageUrl) {
        // Add current image to history before replacing
        if (generatedImage) {
          setGenerationHistory(prev => [...prev, generatedImage]);
        }

        setGeneratedImage(response.imageUrl);
        setIsEditMode(true); // Enable edit mode after first generation
        // Invalidate user query to refresh credits
        queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
        console.log('✅ Generation completed:', response);
      } else {
        throw new Error(response.message || 'Generation failed - no image URL returned');
      }
    } catch (err) {
      console.error('❌ Generation error:', err);

      // Handle insufficient credits error specifically
      if (err instanceof InsufficientCreditsError) {
        setCreditsInfo({
          available: err.creditsAvailable,
          required: err.creditsRequired,
        });
        setShowInsufficientCreditsDialog(true);
        // Clear generic error when showing the credits dialog
        setError(null);
      } else {
        // For other errors, show generic error message
        setError(err instanceof Error ? err.message : 'Failed to generate image');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartOver = () => {
    setGeneratedImage(null);
    setIsEditMode(false);
    setGenerationHistory([]);
    setError(null);
    setRevealComplete(false);
  };

  const handleImageDoubleClick = () => {
    setIsFullscreenOpen(true);
  };

  const handleUndoEdit = () => {
    if (generationHistory.length > 0) {
      const previousImage = generationHistory[generationHistory.length - 1];
      setGeneratedImage(previousImage);
      setGenerationHistory(prev => prev.slice(0, -1));
    }
  };

  const handleSelectHistory = (imageUrl: string, index: number) => {
    if (!generatedImage) return;
    const allImages = [...generationHistory, generatedImage];
    const newHistory = allImages.filter((_, i) => i !== index);
    setGeneratedImage(imageUrl);
    setGenerationHistory(newHistory);
  };

  const handleInputFocusChange = useCallback((focused: boolean) => {
    setIsInputFocused(focused);
  }, []);

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download image:', err);
      alert('Failed to download image');
    }
  };

  const handleShare = async () => {
    if (!generatedImage) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Generated Image',
          text: 'Check out this generated image!',
          url: generatedImage
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Failed to share:', err);
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(generatedImage);
        alert('Image URL copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        alert('Failed to share image');
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] md:block md:relative md:min-h-screen md:h-auto">
      {/* Insufficient Credits Dialog */}
      <InsufficientCreditsDialog
        isOpen={showInsufficientCreditsDialog}
        onClose={() => setShowInsufficientCreditsDialog(false)}
        creditsAvailable={creditsInfo.available}
        creditsRequired={creditsInfo.required}
      />

      {/* Fullscreen Image Viewer */}
      {generatedImage && (
        <FullscreenImageViewer
          isOpen={isFullscreenOpen}
          imageUrl={generatedImage}
          onClose={() => setIsFullscreenOpen(false)}
          onDownload={handleDownload}
          onShare={handleShare}
        />
      )}

      {/* Scrollable content area - hidden on mobile when keyboard is open */}
      <div
        className={`
          flex-1 min-h-0 overflow-y-auto overscroll-contain pb-20
          md:overflow-visible md:flex-none md:pb-28
          transition-all duration-200 ease-out
          ${isTyping && !isGenerating && !generatedImage ? 'max-h-0 opacity-0 overflow-hidden pointer-events-none md:max-h-none md:opacity-100 md:overflow-visible md:pointer-events-auto' : ''}
        `}
      >
      {(isGenerating || (generatedImage && !revealComplete && !error)) ? (
        <div className="flex flex-col items-center justify-center h-full md:min-h-[calc(100vh-12rem)] p-4 sm:p-8">
          <GeneratingShimmer
            images={[
              ...(preEditUrlRef.current ? [preEditUrlRef.current] : []),
              ...uploadedImages.map(img => img.url),
            ]}
            aspectRatio="3/4"
            generatedImageUrl={generatedImage !== preEditUrlRef.current ? generatedImage : null}
            onRevealComplete={() => setRevealComplete(true)}
          />
        </div>
      ) : generatedImage && revealComplete ? (
        <div className="relative flex flex-col items-center justify-center h-full md:min-h-[calc(100vh-12rem)] px-4 py-4 sm:p-8 gap-2 sm:gap-6">
          {/* Desktop: Download and Share buttons - fixed top right */}
          <div className="hidden md:flex fixed top-4 right-6 gap-2 z-20">
            <button
              onClick={handleDownload}
              className="p-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full transition-all shadow-lg border border-gray-200 dark:border-gray-700"
              title="Download image"
            >
              <Download className="h-5 w-5" />
            </button>

            <button
              onClick={handleShare}
              className="p-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full transition-all shadow-lg border border-gray-200 dark:border-gray-700"
              title="Share image"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop: Start Over button - centered above image */}
          <button
            onClick={handleStartOver}
            className="hidden md:block px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full font-medium transition-colors text-base shadow-lg border border-gray-200 dark:border-gray-700"
          >
            Start Over
          </button>

          {/* Mobile: Share button - fixed top left */}
          <button
            onClick={handleShare}
            className="md:hidden fixed top-[4.5rem] left-3 p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full transition-all shadow-md border border-gray-200 dark:border-gray-700 z-20"
            title="Share image"
          >
            <Share2 className="h-4 w-4" />
          </button>

          {/* Mobile: Download button - fixed top right */}
          <button
            onClick={handleDownload}
            className="md:hidden fixed top-[4.5rem] right-3 p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full transition-all shadow-md border border-gray-200 dark:border-gray-700 z-20"
            title="Download image"
          >
            <Download className="h-4 w-4" />
          </button>

          {/* Mobile: Start Over button - centered above image */}
          <button
            onClick={handleStartOver}
            className="md:hidden px-5 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full font-medium transition-colors text-sm shadow-md border border-gray-200 dark:border-gray-700"
          >
            Start Over
          </button>

          <div className="flex flex-col md:flex-row items-center md:justify-center gap-0 md:gap-4 w-full max-w-[90vw] min-[375px]:max-w-[88vw] min-[425px]:max-w-[85vw] sm:max-w-[380px] md:max-w-none">
            {/* Desktop: thumbnails on the left */}
            <EditHistoryThumbnails
              history={generationHistory}
              currentImage={generatedImage}
              onSelect={handleSelectHistory}
            />

            <div className="w-full md:w-auto md:max-w-[420px]">
              <div
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-2 hover:ring-gray-400 dark:hover:ring-gray-500 transition-all shadow-xl animate-in fade-in duration-500 cursor-pointer"
                style={{ aspectRatio: '3/4' }}
                onDoubleClick={handleImageDoubleClick}
              >
                <img
                  src={generatedImage}
                  alt="Generated Image"
                  className="w-full h-full object-cover"
                />
              </div>

            </div>
          </div>

          {/* Undo button below image */}
          {generationHistory.length > 0 && (
            <button
              onClick={handleUndoEdit}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full font-medium transition-colors flex items-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Undo
            </button>
          )}

        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full md:min-h-[calc(100vh-12rem)] p-4 sm:p-8">
          <div className="text-center px-4">
            <p className="text-red-600 dark:text-red-400 font-medium mb-2 text-sm sm:text-base">Generation Failed</p>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{error}</p>
          </div>
        </div>
      ) : uploadedImages.length > 0 ? (
        <UploadedImagesGrid images={uploadedImages} onRemoveImage={handleRemoveImage} />
      ) : (
        <div className="container mx-auto px-4 py-6 sm:p-4 md:p-8 md:pb-32">
          <div className="max-w-7xl mx-auto">
            {/* Feature Cards Grid - Single column on mobile, 2 on tablet, 4 on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4 md:gap-5">
              {features.map((feature) => (
                <FeatureCard key={feature.id} feature={feature} />
              ))}
            </div>
          </div>
        </div>
      )}
      </div>

      {/* FloatingAskBar - fixed to bottom on mobile, fixed on desktop */}
      <div
        ref={barRef}
        className={`
          fixed bottom-0 left-0 right-0 px-3 pt-3 sm:px-6 sm:pt-4
          bg-gradient-to-t from-gray-100 dark:from-gray-950 via-gray-100/95 dark:via-gray-950/95 to-transparent
          md:left-20 md:pointer-events-none z-30
          ${isTyping
            ? 'pb-[max(0.5rem,env(safe-area-inset-bottom))]'
            : 'pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-[max(1rem,env(safe-area-inset-bottom))]'
          }
        `}
      >
        <div className="w-full max-w-3xl mx-auto md:pointer-events-auto">
          <FloatingAskBar
            onFilesSelected={handleFilesSelected}
            onSubmit={handleChatSubmit}
            isGenerating={isGenerating}
            editMode={isEditMode}
            onFocusChange={handleInputFocusChange}
          />
        </div>
      </div>
    </div>
  );
};
