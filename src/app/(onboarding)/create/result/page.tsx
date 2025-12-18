"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/hooks/useOnboarding";
import { CheckCircle } from "lucide-react";

/* ============================================
   Onboarding Result Page
   Celebrates first successful generation
   Reuses the same preview component structure
   as the generation flows for consistency
   ============================================ */

export const dynamic = "force-dynamic";

export default function OnboardingResultPage() {
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>('3:4');

  // Retrieve generated image from sessionStorage
  useEffect(() => {
    const storedImageUrl = sessionStorage.getItem('onboarding-result-image');
    const storedAspectRatio = sessionStorage.getItem('onboarding-result-aspectRatio');
    
    if (storedImageUrl) {
      setImageUrl(storedImageUrl);
      if (storedAspectRatio) {
        setAspectRatio(storedAspectRatio);
      }
    } else {
      // No image found, redirect back to intent selection
      console.warn('No generated image found, redirecting to intent selection');
      router.replace('/intent');
    }
  }, [router]);

  // Convert aspect ratio string to numeric value for styling
  const getAspectRatioValue = (ratio: string): string => {
    switch (ratio) {
      case '1:1': return '1';
      case '3:4': return '3/4';
      case '4:3': return '4/3';
      case '9:16': return '9/16';
      case '16:9': return '16/9';
      default: return '3/4';
    }
  };

  // Download generated image
  const handleDownload = async () => {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vestis-generated-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download image:', err);
      alert('Failed to download image. Please try again.');
    }
  };

  // Complete onboarding and go to dashboard
  const handleCreateAnother = () => {
    // Clean up sessionStorage
    sessionStorage.removeItem('onboarding-result-image');
    sessionStorage.removeItem('onboarding-result-aspectRatio');
    
    // Mark onboarding as complete and redirect to dashboard
    completeOnboarding();
  };

  if (!imageUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm tracking-widest uppercase">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Main content area - centered */}
      <div className="px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Celebration banner */}
          <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Your first image is ready! 🎉
                </h3>
                <p className="text-sm text-gray-600">
                  Looking sharp. Ready to create more?
                </p>
              </div>
            </div>
          </div>
          
          {/* Generated Image - Large centered display */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div 
              className="relative rounded-2xl overflow-hidden shadow-2xl transition-all mx-auto" 
              style={{ 
                aspectRatio: getAspectRatioValue(aspectRatio),
                maxWidth: '600px',
                width: '100%'
              }}
            >
              <img
                src={imageUrl}
                alt="Your generated image"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Action buttons - Centered below image */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-4">
            {/* Download button */}
            <button
              onClick={handleDownload}
              className="w-full sm:flex-1 bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Download
            </button>
            
            {/* Create another image button */}
            <button
              onClick={handleCreateAnother}
              className="w-full sm:flex-1 bg-white text-black border-2 border-gray-300 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Create another image
            </button>
          </div>

          {/* Helper text */}
          <p className="text-center text-xs text-gray-500">
            You can access all your generated images from the dashboard
          </p>
        </div>
      </div>
    </div>
  );
}

