import { useState, useEffect } from 'react';
import { MainContent } from './MainContent';
import { Steps } from './Steps';
import { BackgroundChangeUpload } from './BackgroundChangeUpload';
import { BackgroundSelector } from './BackgroundSelector';
import { BackgroundChangePreviewPanel } from './BackgroundChangePreviewPanel';
import { FloatingPromptInput } from './FloatingPromptInput';
import { BackgroundChangePreview } from './BackgroundChangePreview';
import { useBackgroundChange } from '../hooks/useBackgroundChange';
import type { BackgroundChangePhoto } from '../types/backgroundChange';
import type { Background } from '../types/background';
import { getBackgroundById } from '../services/backgroundService';
import { RotateCw } from 'lucide-react';
import AspectRatio, { type AspectRatioValue } from './aspectRatio';
import Resolution, { type ResolutionValue } from './resolution';

export function BackgroundChange() {
  const [currentStep, setCurrentStep] = useState(0);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(0);
  const [photos, setPhotos] = useState<{ [key: number]: string }>({});
  const [selectedBackgroundId, setSelectedBackgroundId] = useState<number | string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<Background | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioValue>('auto');
  const [resolution, setResolution] = useState<ResolutionValue>('2K');

  // Helper function to convert aspect ratio string to CSS format
  const getAspectRatioValue = (ratio: AspectRatioValue): string => {
    if (ratio === 'auto') return '3/4'; // Default to 3:4
    return ratio.replace(':', '/'); // Convert '16:9' to '16/9'
  };

  const {
    isGenerating,
    generationError,
    generatedImageUrl,
    generateBackgroundChange,
    resetGeneration,
    setGeneratedImageUrl,
  } = useBackgroundChange();

  // Fetch full background object when background ID changes
  useEffect(() => {
    const fetchBackground = async () => {
      if (selectedBackgroundId && typeof selectedBackgroundId === 'number') {
        try {
          const background = await getBackgroundById(selectedBackgroundId);
          setSelectedBackground(background || null);
        } catch (error) {
          console.error('Error fetching background:', error);
        }
      } else {
        setSelectedBackground(null);
      }
    };
    fetchBackground();
  }, [selectedBackgroundId]);

  const handleFileUpload = (index: number, file: File | null) => {
    console.log('handleFileUpload called with index:', index, 'file:', file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        console.log('FileReader result:', result.substring(0, 50) + '...');
        setPhotos(prev => ({
          ...prev,
          [index]: result
        }));
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
      };
      reader.readAsDataURL(file);
    } else {
      // Remove photo if file is null
      setPhotos(prev => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
    }
  };

  const steps = [
    'Upload Photos',
    'Select Background',
    'Preview & Generate'
  ];

  const handleGenerateImage = async () => {
    if (!selectedBackgroundId) {
      console.error('Missing background selection');
      return;
    }

    // Convert photos object to array of BackgroundChangePhoto
    const backgroundChangePhotos: BackgroundChangePhoto[] = Object.entries(photos).map(([id, image]) => ({
      id: id.toString(),
      image,
    }));

    const request = {
      photos: backgroundChangePhotos,
      backgroundId: String(selectedBackgroundId),
      ...(additionalInfo.trim() && { prompt: additionalInfo.trim() }), // Include prompt if not empty
      aspectRatio,
      resolution,
    };

    console.log('🚀 Generating background change with request:', {
      photosCount: backgroundChangePhotos.length,
      backgroundId: request.backgroundId,
      photoIds: backgroundChangePhotos.map(p => p.id),
      hasPrompt: !!additionalInfo.trim(),
      aspectRatio,
      resolution,
    });
    
    // Add current image to history before generating new one
    if (generatedImageUrl) {
      setGenerationHistory(prev => [...prev, generatedImageUrl]);
    }
    
    await generateBackgroundChange(request);
    
    // Enable edit mode and clear prompt after generation
    setIsEditMode(true);
    setAdditionalInfo('');
  };

  const handleUndoEdit = () => {
    if (generationHistory.length > 0) {
      const previousImage = generationHistory[generationHistory.length - 1];
      setGeneratedImageUrl(previousImage);
      setGenerationHistory(prev => prev.slice(0, -1));
    }
  };

  const canProceedToNextStep = (): boolean => {
    switch (currentStep) {
      case 0: // Upload Photos
        return Object.keys(photos).length > 0;
      case 1: // Select Background
        return selectedBackgroundId !== null;
      case 2: // Preview & Generate
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (currentStep === 2) {
      // On the last step, trigger generation
      handleGenerateImage();
    } else if (canProceedToNextStep()) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setMaxUnlockedStep(Math.max(maxUnlockedStep, nextStep));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <BackgroundChangeUpload
            photos={photos}
            onFileUpload={handleFileUpload}
            onClear={() => setPhotos({})}
          />
        );
      case 1:
        return (
          <div className="space-y-6">
            <BackgroundSelector
              selectedBackground={selectedBackgroundId || undefined}
              onBackgroundSelect={(backgroundId) => setSelectedBackgroundId(backgroundId)}
            />
          </div>
        );
      case 2:
        return (
          <BackgroundChangePreview
            isGenerating={isGenerating}
            generationError={generationError}
            generatedImageUrl={generatedImageUrl}
            generationHistory={generationHistory}
            onReset={resetGeneration}
            onUndo={handleUndoEdit}
            aspectRatio={getAspectRatioValue(aspectRatio)}
          />
        );
      default:
        return null;
    }
  };

  const renderRightPanel = () => {
    return (
      <div className="flex flex-col h-full">
        {/* Preview section at the top */}
        <BackgroundChangePreviewPanel
          photos={Object.values(photos)}
          selectedBackground={selectedBackground}
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
          {currentStep === 2 && generatedImageUrl && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = generatedImageUrl;
                link.download = 'background-change.png';
                link.click();
              }}
              className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Download
            </button>
            <button
              onClick={async () => {
                resetGeneration();
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
        {!(currentStep === 2 && generatedImageUrl) && (
          <div className="mt-auto pt-4 pb-4">
            {/* Show error if any */}
            {generationError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {generationError}
              </div>
            )}
            
            <button 
              disabled={!canProceedToNextStep() || isGenerating}
              onClick={handleNextStep}
              className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isGenerating 
                ? 'Generating...' 
                : currentStep === 2 
                ? 'Generate Image' 
                : 'Next Step'}
            </button>
          </div>
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
          
          {/* Floating Input Bar - Only visible on step 3 */}
          {currentStep === 2 && (
            <FloatingPromptInput
              value={additionalInfo}
              onChange={setAdditionalInfo}
              onSubmit={handleGenerateImage}
              placeholder={isEditMode ? "Describe changes to make (e.g., 'make it brighter')..." : "Add more details about your image (optional)..."}
            />
          )}
        </div>
        
        {/* Right Component - 1/4 width */}
        <div className="w-full md:w-1/4 bg-white p-6 m-0 overflow-y-auto flex flex-col">
          {renderRightPanel()}
        </div>
      </div>
    </MainContent>
  );
}
