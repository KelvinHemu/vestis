import { useState } from 'react';
import { MainContent } from './MainContent';
import { Steps } from './Steps';
import { ProductSelector } from './ProductSelector';
import { ModelSelector } from './ModelSelector';
import { BackgroundSelector } from './BackgroundSelector';
import { FlatLayPreviewPanel } from './FlatLayPreviewPanel';
import { FlatLayActionButton } from './FlatLayActionButton';
import { FloatingPromptInput } from './FloatingPromptInput';
import { ImageFeedbackActions } from './ImageFeedbackActions';
import { flatLayService } from '../services/flatLayService';
import { chatService } from '../services/chatService';
import type { ProductImage } from '../types/flatlay';
import { RotateCw } from 'lucide-react';
import AspectRatio, { type AspectRatioValue } from './aspectRatio';
import Resolution, { type ResolutionValue } from './resolution';

// Helper function to convert aspect ratio string to CSS aspect-ratio value
const getAspectRatioValue = (ratio: AspectRatioValue): string => {
  if (ratio === 'auto') return '3/4'; // Default to 3:4
  // Convert ratio like '16:9' to '16/9' for CSS
  return ratio.replace(':', '/');
};

export function FlatLayPhotos() {
  const [currentStep, setCurrentStep] = useState(0);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(0);
  const [selectionType, setSelectionType] = useState<('top' | 'bottom')[]>(['top']);
  const [topImages, setTopImages] = useState<{[key: number]: string}>({});
  const [bottomImages, setBottomImages] = useState<{[key: number]: string}>({});
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<number | string | null>(null);
  
  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioValue>('auto');
  const [resolution, setResolution] = useState<ResolutionValue>('2K');

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

  const steps = [
    'Select Products',
    'Select Models',
    // 'Customize Models',
    // 'Select Poses',
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

    setIsGenerating(true);
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
          setGeneratedImageUrl(response.imageUrl);
          setAdditionalInfo('');
        } else {
          throw new Error(response.message || 'Image editing failed');
        }
        setIsGenerating(false);
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
        setGenerationError('Please upload at least one product image');
        setIsGenerating(false);
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
            setGeneratedImageUrl(finalStatus.imageUrl);
            setIsEditMode(true);
            setAdditionalInfo('');
          } else {
            throw new Error(finalStatus.error || 'Image generation failed');
          }
        } else if (response.imageUrl) {
          // Immediate response with image URL
          setGeneratedImageUrl(response.imageUrl);
          setIsEditMode(true);
          setAdditionalInfo('');
        }
      } else {
        throw new Error(response.message || 'Image generation failed');
      }
    } catch (error) {
      console.error('Error generating flatlay:', error);
      setGenerationError(
        error instanceof Error ? error.message : 'Failed to generate image'
      );
    } finally {
      setIsGenerating(false);
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
          <ProductSelector
            selectionType={selectionType}
            onSelectionTypeChange={setSelectionType}
            imageUrls={currentImages}
            onFileUpload={handleFileUpload}
            onClear={() => {
              setTopImages({});
              setBottomImages({});
            }}
          />
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
            <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-6">
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
              ) : generatedImageUrl ? (
                <div 
                  className="relative rounded-3xl overflow-hidden ring-1 ring-gray-200 hover:ring-2 hover:ring-gray-400 transition-all shadow-xl animate-in fade-in duration-500 mx-auto" 
                  style={{ 
                    width: '380px', 
                    aspectRatio: getAspectRatioValue(aspectRatio)
                  }}
                >
                  <img 
                    src={generatedImageUrl} 
                    alt="Generated Flatlay" 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Image Feedback Actions */}
                  <ImageFeedbackActions
                    onUndo={handleUndoEdit}
                    onThumbsUp={() => console.log('Thumbs up')}
                    onThumbsDown={() => console.log('Thumbs down')}
                    showUndo={generationHistory.length > 0}
                  />
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-semibold text-gray-900">Ready to Create</h2>
                  {/* <p className="text-gray-600 text-lg">
                    Review your selections on the right and click "Generate Image" to create your flatlay photo.
                  </p> */}
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
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        if (nextStep > maxUnlockedStep) {
          setMaxUnlockedStep(nextStep);
        }
      }
    };

    return (
      <div className="flex flex-col h-full">
        {/* Preview section at the top */}
        <FlatLayPreviewPanel
          selectionType={selectionType}
          topImages={topImages}
          bottomImages={bottomImages}
        />
        
        {/* Spacer to push content to bottom */}
        <div className="flex-1"></div>
        
        {/* Selected Items and Button at the bottom */}
        <div className="space-y-6">
          {/* Aspect Ratio Selector */}
          <div>
            <AspectRatio
              value={aspectRatio}
              onValueChange={setAspectRatio}
            />
          </div>
          
          {/* Resolution Selector */}
          <div>
            <Resolution
              value={resolution}
              onValueChange={setResolution}
            />
          </div>

          {/* Show Download button after image is generated */}
          {currentStep === 3 && generatedImageUrl && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = generatedImageUrl;
                  link.download = 'flatlay-image.png';
                  link.click();
                }}
                className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
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
                className="px-3 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Regenerate Image"
              >
                <RotateCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
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
      {/* Content Area with Left and Right Sections */}
      <div className="flex gap-0 h-full border-2 border-gray-300">
        {/* Left Component - 3/4 width */}
        <div className="flex-1 bg-white border-r-2 border-gray-300 m-0 overflow-y-auto relative">
          <div className="border-b-2 border-gray-300">
            <Steps 
              steps={steps} 
              currentStep={currentStep}
              maxUnlockedStep={maxUnlockedStep}
              onStepChange={setCurrentStep}
            />
          </div>
          <div className="p-8">
            {renderStepContent()}
          </div>
          
          {/* Floating Input Bar - Only visible on step 3 (Preview & Generate) */}
          {currentStep === 3 && (
            <FloatingPromptInput
              value={additionalInfo}
              onChange={setAdditionalInfo}
              onSubmit={handleGenerateImage}
              placeholder={isEditMode ? "Describe changes to make (e.g., 'adjust colors')..." : "Add more details about your image (optional)..."}
            />
          )}
        </div>
        
        {/* Right Component - 1/4 width */}
        <div className="w-full md:w-1/4 bg-white p-6 m-0 overflow-y-auto flex flex-col justify-end">
          {renderRightPanel()}
        </div>
      </div>
    </MainContent>
  );
}
