import React, { useState } from 'react';
import { Download, Share2 } from 'lucide-react';
import { FeatureCard, features } from './FeatureCard';
import { FloatingAskBar } from './FloatingAskBar';
import { UploadedImagesGrid } from './UploadedImagesGrid';
import { LoadingSpinner } from './LoadingSpinner';
import { InsufficientCreditsDialog } from './ui/InsufficientCreditsDialog';
import { FullscreenImageViewer } from './ui/FullscreenImageViewer';
import { chatService } from '../services/chatService';
import { InsufficientCreditsError } from '../types/errors';

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

  // Check for image from history on mount
  React.useEffect(() => {
    const editImage = sessionStorage.getItem('editImage');
    if (editImage) {
      setGeneratedImage(editImage);
      setIsEditMode(true);
      sessionStorage.removeItem('editImage'); // Clean up
    }
  }, []);

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
    <div className="relative min-h-screen pb-32 sm:pb-28">
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
      
      {isGenerating ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] sm:min-h-[calc(100vh-12rem)] p-4 sm:p-8">
          <LoadingSpinner/>
        </div>
      ) : generatedImage ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] sm:min-h-[calc(100vh-12rem)] px-4 py-6 sm:p-8 gap-4 sm:gap-6">
          {/* Action buttons row - responsive layout */}
          <div className="flex items-center justify-between w-full max-w-md sm:max-w-none sm:justify-center gap-2 sm:gap-4">
            {/* Start Over button */}
            <button
              onClick={handleStartOver}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-colors text-sm sm:text-base"
            >
              Start Over
            </button>
            
            {/* Download and Share buttons - inline on mobile, fixed on desktop */}
            <div className="flex gap-2 sm:fixed sm:top-8 sm:right-8 sm:z-10">
              <button
                onClick={handleDownload}
                className="p-2 sm:p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-all shadow-sm"
                title="Download image"
              >
                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              
              <button
                onClick={handleShare}
                className="p-2 sm:p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-all shadow-sm"
                title="Share image"
              >
                <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
          
          <div 
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden ring-1 ring-gray-200 hover:ring-2 hover:ring-gray-400 transition-all shadow-xl animate-in fade-in duration-500 cursor-pointer w-full max-w-[280px] sm:max-w-[320px] md:max-w-[380px]" 
            style={{ aspectRatio: '3/4' }}
            onDoubleClick={handleImageDoubleClick}
          >
            <img 
              src={generatedImage} 
              alt="Generated Image" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Undo button below image */}
          {generationHistory.length > 0 && (
            <button
              onClick={handleUndoEdit}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-colors flex items-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Undo
            </button>
          )}
          
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] sm:min-h-[calc(100vh-12rem)] p-4 sm:p-8">
          <div className="text-center px-4">
            <p className="text-red-600 font-medium mb-2 text-sm sm:text-base">Generation Failed</p>
            <p className="text-gray-600 text-xs sm:text-sm">{error}</p>
          </div>
        </div>
      ) : uploadedImages.length > 0 ? (
        <UploadedImagesGrid images={uploadedImages} onRemoveImage={handleRemoveImage} />
      ) : (
        <div className="container mx-auto px-2 py-3 sm:p-4 md:p-8 pb-28 sm:pb-32">
          <div className="max-w-7xl mx-auto">
            {/* Feature Cards Grid - 2 columns on mobile for compact view */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {features.map((feature) => (
                <FeatureCard key={feature.id} feature={feature} />
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Fixed FloatingAskBar at bottom - responsive positioning */}
      <div className="fixed bottom-0 left-0 sm:left-16 right-0 px-3 py-4 sm:p-6 bg-gradient-to-t from-gray-100 via-gray-100 to-transparent pointer-events-none z-20">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <FloatingAskBar 
            onFilesSelected={handleFilesSelected} 
            onSubmit={handleChatSubmit}
            isGenerating={isGenerating}
            editMode={isEditMode}
          />
        </div>
      </div>
    </div>
  );
};
