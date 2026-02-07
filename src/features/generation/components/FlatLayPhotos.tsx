"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { MainContent } from '@/components/layout/MainContent';
import { Steps } from './Steps';
import { ProductSelector } from './ProductSelector';
import { ModelSelector } from '@/features/models/components/ModelSelector';
import { BackgroundSelector } from './BackgroundSelector';
import { FlatLayPreviewPanel } from './FlatLayPreviewPanel';
import { FlatLayActionButton } from './FlatLayActionButton';
import { FloatingPromptInput } from './FloatingPromptInput';
import { ImageFeedbackActions } from './ImageFeedbackActions';
import { InsufficientCreditsDialog } from '@/components/ui/InsufficientCreditsDialog';
import { FullscreenImageViewer } from '@/components/ui/FullscreenImageViewer';
import { flatLayService } from '@/services/flatLayService';
import { chatService } from '@/services/chatService';
import { InsufficientCreditsError } from '@/types/errors';
import { useInvalidateGenerations } from '@/hooks/useGenerations';
import { useInvalidateFlatLay } from '@/hooks/useFlatLay';
import { useModels } from '@/hooks/useModels';
import { useCustomModels } from '@/hooks/useCustomModels';
import { useCustomBackgroundsList } from '@/hooks/useCustomBackgrounds';
import { getBackgrounds } from '@/services/backgroundService';
import { useFlatLayStore } from '@/contexts/featureStores';
import { useFeatureGeneration } from '@/contexts/generationStore';
import type { ProductImage } from '@/types/flatlay';
import type { Background } from '@/types/background';
import { RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';
import AspectRatio from '@/components/shared/aspectRatio';
import Resolution from '@/components/shared/resolution';
import { FeatureEvents } from '@/utils/analytics';
import modelService from '@/services/modelService';

// Helper function to convert aspect ratio string to CSS aspect-ratio value
const getAspectRatioValue = (ratio: string): string => {
  if (ratio === 'auto') return '3/4'; // Default to 3:4
  // Convert ratio like '16:9' to '16/9' for CSS
  return ratio.replace(':', '/');
};

export function FlatLayPhotos() {

  // Get persisted state from store
  const {
    currentStep,
    maxUnlockedStep,
    selectionType,
    topImages,
    bottomImages,
    selectedModel,
    selectedBackground,
    generatedImageUrl,
    additionalInfo,
    isEditMode,
    generationHistory,
    aspectRatio,
    resolution,
    setCurrentStep,
    setMaxUnlockedStep,
    setSelectionType,
    setTopImages,
    setBottomImages,
    setSelectedModel,
    setSelectedBackground,
    setGeneratedImageUrl,
    setAdditionalInfo,
    setIsEditMode,
    setGenerationHistory,
    setAspectRatio,
    setResolution,
    resetFlatLay,
  } = useFlatLayStore();

  // Generation state from global store (persists across navigation)
  const {
    isGenerating,
    error: generationStoreError,
    generatedImageUrl: newGeneratedImageUrl,
    startGeneration,
    completeGeneration,
    failGeneration,
    resetGeneration,
  } = useFeatureGeneration('flatlay');

  // Handle Start Over - reset all state
  const handleStartOver = () => {
    resetFlatLay();
    resetGeneration();
    setGenerationError(null);
  };

  // Local (non-persisted) state for transient UI states
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [insufficientCredits, setInsufficientCredits] = useState<{ available: number; required: number } | null>(null);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [selectedGalleryTop, setSelectedGalleryTop] = useState<string | undefined>();
  const [selectedGalleryBottom, setSelectedGalleryBottom] = useState<string | undefined>();
  // iOS Safari (especially iPhone 15 Pro Max) can fail to render cross-origin images.
  // Only converts to blob URL on error — zero overhead on normal browsers.
  const [fallbackBlobUrl, setFallbackBlobUrl] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Reset fallback blob URL when generated image changes
  useEffect(() => {
    setFallbackBlobUrl(null);
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, [generatedImageUrl]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  // Called only when <img> fails to load — fetches as blob for iOS Safari
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    // If we already tried the blob fallback, give up
    if (fallbackBlobUrl || !generatedImageUrl) return;
    // Don't retry data/blob URLs
    if (generatedImageUrl.startsWith('data:') || generatedImageUrl.startsWith('blob:')) return;

    fetch(generatedImageUrl, { mode: 'cors' })
      .then(res => {
        if (!res.ok) throw new Error('fetch failed');
        return res.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setFallbackBlobUrl(url);
      })
      .catch(() => {
        // Nothing more we can do
        console.warn('iOS image fallback also failed for:', generatedImageUrl);
      });
  };

  // Sync generation store error with local error state
  useEffect(() => {
    if (generationStoreError) {
      setGenerationError(generationStoreError);
    }
  }, [generationStoreError]);

  // Cache invalidation hooks
  const invalidateGenerations = useInvalidateGenerations();
  const invalidateFlatLay = useInvalidateFlatLay();

  // Fetch models and backgrounds for preview
  const { data: modelsData } = useModels();
  const { data: customModelsData } = useCustomModels();
  const { data: customBackgroundsData } = useCustomBackgroundsList();
  const [systemBackgrounds, setSystemBackgrounds] = useState<Background[]>([]);

  // Fetch system backgrounds
  useEffect(() => {
    getBackgrounds().then(res => setSystemBackgrounds(res.backgrounds));
  }, []);

  // Find selected model image
  const selectedModelImage = useMemo(() => {
    if (!selectedModel) return null;
    
    // Check if it's a custom model
    if (selectedModel.startsWith('custom_')) {
      const customId = parseInt(selectedModel.replace('custom_', ''));
      const customModel = customModelsData?.models?.find(m => m.id === customId);
      return customModel?.image_url || null;
    }
    
    // Platform model
    const platformModel = modelsData?.models?.find(m => m.id.toString() === selectedModel);
    if (platformModel) {
      return modelService.getMainImage(platformModel) || null;
    }
    return null;
  }, [selectedModel, modelsData, customModelsData]);

  // Find selected background image
  const selectedBackgroundImage = useMemo(() => {
    if (!selectedBackground) return null;
    
    // Check if it's a custom background
    if (typeof selectedBackground === 'string' && selectedBackground.startsWith('custom-')) {
      const customId = parseInt(selectedBackground.replace('custom-', ''));
      const customBg = customBackgroundsData?.find(bg => bg.id === customId);
      return customBg?.url || null;
    }
    
    // System background (by ID)
    const bgId = typeof selectedBackground === 'string' ? parseInt(selectedBackground) : selectedBackground;
    const systemBg = systemBackgrounds.find(bg => bg.id === bgId);
    return systemBg?.url || null;
  }, [selectedBackground, customBackgroundsData, systemBackgrounds]);

  // When generation completes in background, update the persisted state
  useEffect(() => {
    if (newGeneratedImageUrl && newGeneratedImageUrl !== generatedImageUrl) {
      setGeneratedImageUrl(newGeneratedImageUrl);
      setIsEditMode(true);
      setAdditionalInfo('');
      // Invalidate caches to show new generation in history
      invalidateGenerations();
      invalidateFlatLay();
    }
  }, [newGeneratedImageUrl, generatedImageUrl, aspectRatio, invalidateGenerations, invalidateFlatLay, setGeneratedImageUrl, setIsEditMode, setAdditionalInfo]);

  const handleFileUpload = (index: number, file: File | null) => {
    console.log('handleFileUpload called with index:', index, 'file:', file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        console.log('FileReader result:', result.substring(0, 50) + '...');

        // Store in the appropriate state based on current selection
        if (selectionType.includes('top') && !selectionType.includes('bottom')) {
          setTopImages(prev => ({
            ...prev,
            [index]: result
          }));
        } else if (selectionType.includes('bottom') && !selectionType.includes('top')) {
          setBottomImages(prev => ({
            ...prev,
            [index]: result
          }));
        } else {
          // Full body - store in both
          setTopImages(prev => ({
            ...prev,
            [index]: result
          }));
          setBottomImages(prev => ({
            ...prev,
            [index]: result
          }));
        }
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
      };
      reader.readAsDataURL(file);
    } else {
      // Remove image if file is null
      if (selectionType.includes('top') && !selectionType.includes('bottom')) {
        setTopImages(prev => {
          const newState = { ...prev };
          delete newState[index];
          return newState;
        });
      } else if (selectionType.includes('bottom') && !selectionType.includes('top')) {
        setBottomImages(prev => {
          const newState = { ...prev };
          delete newState[index];
          return newState;
        });
      } else {
        setTopImages(prev => {
          const newState = { ...prev };
          delete newState[index];
          return newState;
        });
        setBottomImages(prev => {
          const newState = { ...prev };
          delete newState[index];
          return newState;
        });
      }
    }
  };

  // Handle gallery clothing selection
  const handleGallerySelect = async (type: 'top' | 'bottom', frontImage: string, backImage: string) => {
    // Update selected state for visual feedback
    if (type === 'top') {
      setSelectedGalleryTop(frontImage);
    } else {
      setSelectedGalleryBottom(frontImage);
    }

    // Fetch the images and convert to data URLs for the upload areas
    const fetchImageAsDataUrl = async (url: string): Promise<string> => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error('Failed to fetch image:', error);
        return url; // Fallback to URL if fetch fails
      }
    };

    try {
      const [frontDataUrl, backDataUrl] = await Promise.all([
        fetchImageAsDataUrl(frontImage),
        fetchImageAsDataUrl(backImage)
      ]);

      if (type === 'top') {
        setTopImages({ 1: frontDataUrl, 2: backDataUrl });
      } else {
        setBottomImages({ 1: frontDataUrl, 2: backDataUrl });
      }
    } catch (error) {
      console.error('Failed to load gallery images:', error);
    }
  };

  const steps = [
    'Select Products',
    'Select Models',
    'Select Background',
    'Preview & Generate'
  ];

  // Handle undo edit
  const handleUndoEdit = () => {
    if (generationHistory.length > 0) {
      const previousImage = generationHistory[generationHistory.length - 1];
      setGeneratedImageUrl(previousImage);
      setGenerationHistory(prev => prev.slice(0, -1));
    }
  };

  // Generate flatlay image
  const handleGenerateImage = async () => {
    if (!selectedModel || !selectedBackground) {
      setGenerationError('Please select a model and background');
      return;
    }

    // Add current image to history before generating new one
    if (generatedImageUrl) {
      setGenerationHistory(prev => [...prev, generatedImageUrl]);
    }

    // Start generation in global store (persists across navigation)
    startGeneration();
    setGenerationError(null);

    try {
      // If we're in edit mode and have a prompt, use chat service for editing
      if (isEditMode && additionalInfo.trim() && generatedImageUrl) {
        console.log('✏️ Editing image with chat service');
        const response = await chatService.editImage(
          generatedImageUrl,
          additionalInfo.trim()
        );

        // Chat service returns completed images directly, no need to poll
        if (response.imageUrl) {
          completeGeneration(response.imageUrl);
        } else {
          throw new Error(response.message || 'Image editing failed');
        }
        return;
      }

      // Build products array
      const products: ProductImage[] = [];

      // Add top images if they exist
      if (Object.keys(topImages).length > 0) {
        const topProduct: ProductImage = {
          type: 'top',
        };

        // Only add images if they actually exist
        if (topImages[1]) {
          topProduct.frontImage = topImages[1];
        }
        if (topImages[2]) {
          topProduct.backImage = topImages[2];
        }

        // Only add product if at least one image exists
        if (topProduct.frontImage || topProduct.backImage) {
          products.push(topProduct);
        }
      }

      // Add bottom images if they exist
      if (Object.keys(bottomImages).length > 0) {
        const bottomProduct: ProductImage = {
          type: 'bottom',
        };

        // Only add images if they actually exist
        if (bottomImages[1]) {
          bottomProduct.frontImage = bottomImages[1];
        }
        if (bottomImages[2]) {
          bottomProduct.backImage = bottomImages[2];
        }

        // Only add product if at least one image exists
        if (bottomProduct.frontImage || bottomProduct.backImage) {
          products.push(bottomProduct);
        }
      }

      // Validate we have at least one product with at least one image
      if (products.length === 0) {
        failGeneration('Please upload at least one product image');
        return;
      }

      console.log('📦 Sending generation request with products:', products.length);
      console.log('📦 Model ID:', selectedModel, 'Type:', typeof selectedModel);
      console.log('📦 Background ID:', selectedBackground, 'Type:', typeof selectedBackground);
      console.log('📦 Aspect Ratio:', aspectRatio);
      console.log('📦 Resolution:', resolution);

      // Call generation service
      const response = await flatLayService.generateFlatlay({
        products,
        modelId: selectedModel,
        backgroundId: selectedBackground,
        aspectRatio: aspectRatio,
        resolution: resolution,
        options: {
          quality: 'high',
          format: 'png',
        },
      });

      if (response.success) {
        // If we have a job ID, poll for status
        if (response.jobId) {

          const finalStatus = await flatLayService.pollJobStatus(
            response.jobId,
            () => {
              // Status update callback - can be used for logging if needed
            }
          );

          if (finalStatus.status === 'completed' && finalStatus.imageUrl) {
            completeGeneration(finalStatus.imageUrl);
          } else {
            throw new Error(finalStatus.error || 'Image generation failed');
          }
        } else if (response.imageUrl) {
          // Immediate response with image URL
          completeGeneration(response.imageUrl);
        }
      } else {
        throw new Error(response.message || 'Image generation failed');
      }
    } catch (error) {
      console.error('Error generating flatlay:', error);

      // Handle insufficient credits error specifically
      if (error instanceof InsufficientCreditsError) {
        setInsufficientCredits({
          available: error.creditsAvailable,
          required: error.creditsRequired,
        });
        failGeneration('');  // Clear generating state but don't show error (dialog will show)
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
        failGeneration(errorMessage);
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        // Get current images based on selection
        const currentImages = selectionType.includes('top') && !selectionType.includes('bottom')
          ? topImages
          : selectionType.includes('bottom') && !selectionType.includes('top')
            ? bottomImages
            : { ...topImages, ...bottomImages };

        console.log('Rendering step 0, current images:', currentImages);
        return (
          <>

            <ProductSelector
              selectionType={selectionType}
              onSelectionTypeChange={setSelectionType}
              imageUrls={currentImages}
              onFileUpload={handleFileUpload}
              onClear={() => {
                setTopImages({});
                setBottomImages({});
                setSelectedGalleryTop(undefined);
                setSelectedGalleryBottom(undefined);
              }}
              onSelectGalleryClothing={handleGallerySelect}
              selectedGalleryTop={selectedGalleryTop}
              selectedGalleryBottom={selectedGalleryBottom}
            />
          </>
        );
      case 1:
        return (
          <div className="space-y-6">
            <ModelSelector
              selectedModel={selectedModel || undefined}
              onModelSelect={(modelId) => setSelectedModel(modelId)}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <BackgroundSelector
              selectedBackground={selectedBackground || undefined}
              onBackgroundSelect={(backgroundId) => setSelectedBackground(backgroundId)}
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">

            <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-3 sm:gap-4 md:gap-6">
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <style>{`
                    @keyframes l4 {
                      to { width: 25px; aspect-ratio: 1; }
                    }
                    .custom-loader {
                      width: 60px;
                      aspect-ratio: 4;
                      --c: #000 90%, #0000;
                      background: 
                        radial-gradient(circle closest-side at left 6px top 50%, var(--c)),
                        radial-gradient(circle closest-side, var(--c)),
                        radial-gradient(circle closest-side at right 6px top 50%, var(--c));
                      background-size: 100% 100%;
                      background-repeat: no-repeat;
                      animation: l4 1s infinite alternate;
                    }
                  `}</style>
                  <div className="custom-loader"></div>
                </div>
              ) : generationError ? (
                <div className="text-center max-w-md">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Generation Failed</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{generationError}</p>
                    <button
                      onClick={() => {
                        setGenerationError(null);
                        handleGenerateImage();
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
                    >
                      <RotateCw className="w-4 h-4" />
                      Try Again
                    </button>
                  </div>
                </div>
              ) : generatedImageUrl ? (
                <>
                  {/* Start Over button */}
                  <button
                    onClick={handleStartOver}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-medium transition-colors text-xs sm:text-sm"
                  >
                    Start Over
                  </button>

                  <div
                    className="relative rounded-2xl sm:rounded-3xl overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-2 hover:ring-gray-400 dark:hover:ring-gray-500 transition-all shadow-xl animate-in fade-in duration-500 mx-auto cursor-pointer w-full max-w-[92%] sm:max-w-[360px] md:max-w-[400px] lg:max-w-[440px] xl:max-w-[480px] mb-20"
                    style={{ aspectRatio: getAspectRatioValue(aspectRatio) }}
                    onDoubleClick={() => setIsFullscreenOpen(true)}
                  >
                    <img
                      src={fallbackBlobUrl || generatedImageUrl}
                      alt="Generated Flatlay"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />

                    {/* Image Feedback Actions */}
                    <ImageFeedbackActions
                      onUndo={handleUndoEdit}
                      onThumbsUp={() => console.log('Thumbs up')}
                      onThumbsDown={() => console.log('Thumbs down')}
                      showUndo={generationHistory.length > 0}
                    />
                  </div>
                </>
              ) : (
                <div className="w-full px-4 md:hidden">
                  {(() => {
                    // Collect all product images
                    const allProductImages = [
                      ...Object.entries(topImages).map(([key, url]) => ({ key: `top-${key}`, url })),
                      ...Object.entries(bottomImages).map(([key, url]) => ({ key: `bottom-${key}`, url }))
                    ];

                    // If only one product image, show it with model in first row
                    if (allProductImages.length === 1) {
                      return (
                        <>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="aspect-[3/4] rounded-xl overflow-hidden">
                              <img src={allProductImages[0].url} alt="Product" className="w-full h-full object-cover" />
                            </div>
                            {selectedModelImage && (
                              <div className="aspect-[3/4] rounded-xl overflow-hidden">
                                <img src={selectedModelImage} alt="Model" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                          {selectedBackgroundImage && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="aspect-[3/4] rounded-xl overflow-hidden">
                                <img src={selectedBackgroundImage} alt="Background" className="w-full h-full object-cover" />
                              </div>
                            </div>
                          )}
                        </>
                      );
                    }

                    // Multiple product images or no products
                    return (
                      <>
                        {allProductImages.length > 0 && (
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            {allProductImages.map(({ key, url }) => (
                              <div key={key} className="aspect-[3/4] rounded-xl overflow-hidden">
                                <img src={url} alt="Product" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          {selectedModelImage && (
                            <div className="aspect-[3/4] rounded-xl overflow-hidden">
                              <img src={selectedModelImage} alt="Model" className="w-full h-full object-cover" />
                            </div>
                          )}
                          {selectedBackgroundImage && (
                            <div className="aspect-[3/4] rounded-xl overflow-hidden">
                              <img src={selectedBackgroundImage} alt="Background" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderRightPanel = () => {
    const topImagesCount = Object.keys(topImages).length;
    const bottomImagesCount = Object.keys(bottomImages).length;
    const uploadedImagesCount = topImagesCount + bottomImagesCount;
    const isFullBody = selectionType.length === 2 &&
      selectionType.includes('top') &&
      selectionType.includes('bottom');

    // Validation logic
    const hasUploadedAnyProduct = uploadedImagesCount >= 1; // At least one image (front OR back)
    const hasSelectedModel = selectedModel !== null;
    const hasSelectedBackground = selectedBackground !== null;

    // Determine if user can proceed to next step
    const canProceedToNextStep = () => {
      switch (currentStep) {
        case 0: // Product selection
          // If Full Body: can proceed if at least one image uploaded
          // If Top or Bottom only: go to opposite selection on next click
          return hasUploadedAnyProduct;
        case 1: // Model selection
          return hasSelectedModel;
        case 2: // Background selection
          return hasSelectedBackground;
        case 3: // Preview & Generate step
          // Can generate if not already generating and all items selected
          return !isGenerating && hasUploadedAnyProduct && hasSelectedModel && hasSelectedBackground && !generatedImageUrl;
        default:
          return true;
      }
    };

    // Handle next step logic
    const handleNextStep = async () => {
      if (currentStep === 0) {
        const hasTopImages = Object.keys(topImages).length > 0;
        const hasBottomImages = Object.keys(bottomImages).length > 0;

        // If both top and bottom images exist, proceed to next step
        if (hasTopImages && hasBottomImages) {
          const nextStep = currentStep + 1;
          setCurrentStep(nextStep);
          if (nextStep > maxUnlockedStep) {
            setMaxUnlockedStep(nextStep);
          }
          return;
        }

        // If user selected only Top and hasn't uploaded bottom yet, switch to Bottom
        if (selectionType.length === 1 && selectionType.includes('top') && !hasBottomImages) {
          setSelectionType(['bottom']);
          return;
        }
        // If user selected only Bottom and hasn't uploaded top yet, switch to Top
        if (selectionType.length === 1 && selectionType.includes('bottom') && !hasTopImages) {
          setSelectionType(['top']);
          return;
        }
        // If Full Body, proceed to next step
        if (isFullBody) {
          const nextStep = currentStep + 1;
          setCurrentStep(nextStep);
          if (nextStep > maxUnlockedStep) {
            setMaxUnlockedStep(nextStep);
          }
        }
      } else if (currentStep === 3) {
        // Step 3 (Preview & Generate) - Generate Image action
        await handleGenerateImage();
      } else {
        // For other steps, just move forward
        let nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        if (nextStep > maxUnlockedStep) {
          setMaxUnlockedStep(nextStep);
        }
      }
    };

    return (
      <div className="flex flex-col h-full">
        {/* Preview section - hidden on phone only */}
        <div className="hidden md:block">
          <FlatLayPreviewPanel
            selectionType={selectionType}
            topImages={topImages}
            bottomImages={bottomImages}
          />
        </div>

        {/* Spacer to push content to bottom - hidden on mobile */}
        <div className="hidden md:block md:flex-1"></div>

        {/* Selected Items and Button at the bottom */}
        <div className="space-y-3 md:space-y-6">
          {/* Aspect Ratio Selector - Only show on desktop sidebar */}
          <div className="hidden md:block">
            <AspectRatio
              value={aspectRatio}
              onValueChange={setAspectRatio}
            />
          </div>

          {/* Resolution Selector - Only show on desktop sidebar */}
          <div className="hidden md:block">
            <Resolution
              value={resolution}
              onValueChange={setResolution}
            />
          </div>

          {/* Show Download and Regenerate buttons after image is generated */}
          {currentStep === 3 && generatedImageUrl && (
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(generatedImageUrl);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);

                    // iOS Safari doesn't support the download attribute or programmatic link clicks.
                    // Open in new tab so the user can long-press → Save Image.
                    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

                    if (isIOS) {
                      window.open(url, '_blank');
                      // Delay revoke so the new tab has time to load the blob
                      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
                    } else {
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'flatlay-image.png';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
                    }

                    // Track download event
                    FeatureEvents.downloadImage('flatlay');
                  } catch (err) {
                    console.error('Failed to download image:', err);
                    // Fallback: open the original URL directly
                    window.open(generatedImageUrl, '_blank');
                  }
                }}
                className="flex-1 bg-black dark:bg-white text-white dark:text-black py-2.5 md:py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-sm md:text-base"
              >
                Download
              </button>
              <button
                onClick={async () => {
                  setGeneratedImageUrl(null);
                  setGenerationError(null);
                  await handleGenerateImage();
                }}
                disabled={isGenerating}
                className="px-2.5 md:px-3 py-2.5 md:py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Regenerate Image"
              >
                <RotateCw className={`w-4 h-4 md:w-5 md:h-5 ${isGenerating ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}

          {/* Show action button - hide only after image is generated */}
          {!(currentStep === 3 && generatedImageUrl) && (
            <FlatLayActionButton
              generationError={generationError}
              isGenerating={isGenerating}
              canProceed={canProceedToNextStep()}
              currentStep={currentStep}
              totalSteps={steps.length}
              onNextStep={handleNextStep}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <MainContent
      showBackButton={false}
    >
      {/* Insufficient Credits Dialog */}
      <InsufficientCreditsDialog
        isOpen={!!insufficientCredits}
        onClose={() => setInsufficientCredits(null)}
        creditsAvailable={insufficientCredits?.available || 0}
        creditsRequired={insufficientCredits?.required || 1}
      />

      {/* Fullscreen Image Viewer */}
      {generatedImageUrl && (
        <FullscreenImageViewer
          isOpen={isFullscreenOpen}
          imageUrl={generatedImageUrl}
          onClose={() => setIsFullscreenOpen(false)}
          onDownload={async () => {
            try {
              const response = await fetch(generatedImageUrl);
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);

              const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

              if (isIOS) {
                window.open(url, '_blank');
                setTimeout(() => window.URL.revokeObjectURL(url), 60000);
              } else {
                const link = document.createElement('a');
                link.href = url;
                link.download = 'flatlay-image.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(() => window.URL.revokeObjectURL(url), 1000);
              }

              // Track download event
              FeatureEvents.downloadImage('flatlay');
            } catch (err) {
              console.error('Failed to download image:', err);
              window.open(generatedImageUrl, '_blank');
            }
          }}
        />
      )}

      {/* Content Area with Left and Right Sections */}
      <div className="flex flex-col md:flex-row gap-0 h-full border-2 border-gray-300 dark:border-gray-700 overflow-hidden">
        {/* Left Component - full width on phone, flex-1 on tablet+ */}
        <div className="flex-1 bg-white dark:bg-[#1A1A1A] md:border-r-2 border-gray-300 dark:border-gray-700 m-0 relative min-h-0 pb-20 md:pb-0 flex flex-col">
          {/* Desktop Steps */}
          <div className="hidden md:block border-b-2 border-gray-300 dark:border-gray-700">
            <Steps
              steps={steps}
              currentStep={currentStep}
              maxUnlockedStep={maxUnlockedStep}
              onStepChange={setCurrentStep}
            />
          </div>

          {/* Mobile Navigation - Top bar with back/next */}
          <div className="md:hidden bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-gray-700 px-3 py-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  if (currentStep > 0) {
                    setCurrentStep(currentStep - 1);
                  }
                }}
                disabled={currentStep === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              
              <div className="flex flex-col items-center">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {steps[currentStep]}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              
              <button
                onClick={() => {
                  if (currentStep < steps.length - 1) {
                    const nextStep = currentStep + 1;
                    if (nextStep <= maxUnlockedStep || currentStep + 1 <= maxUnlockedStep) {
                      setCurrentStep(nextStep);
                      if (nextStep > maxUnlockedStep) setMaxUnlockedStep(nextStep);
                    }
                  }
                }}
                disabled={currentStep >= steps.length - 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8">
            {renderStepContent()}
          </div>

          {/* Floating Input Bar - Only visible on step 3 (Preview & Generate) */}
          {currentStep === 3 && !generatedImageUrl && (
            <FloatingPromptInput
              value={additionalInfo}
              onChange={setAdditionalInfo}
              onSubmit={handleGenerateImage}
              placeholder={isEditMode ? "Describe changes to make (e.g., 'adjust colors')..." : "Add more details about your image (optional)..."}
            />
          )}
        </div>

        {/* Right Component - fixed bottom bar on phone, sidebar on tablet+ */}
        <div className="fixed bottom-4 left-3 right-3 md:static md:w-80 lg:w-96 bg-transparent md:bg-white md:dark:bg-[#1A1A1A] p-0 md:p-6 m-0 md:overflow-y-auto flex flex-col md:border-t-0 border-gray-300 dark:border-gray-700 shrink-0 z-50 md:max-h-none overflow-y-auto">
          {renderRightPanel()}
        </div>
      </div>
    </MainContent>
  );
}
