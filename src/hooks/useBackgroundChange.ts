import { useState, useCallback } from 'react';
import { backgroundChangeService } from '../services/backgroundChangeService';
import { InsufficientCreditsError } from '../types/errors';
import { useFeatureGeneration } from '../contexts/generationStore';
import type { GenerateBackgroundChangeRequest, BackgroundChangeJobStatus } from '../types/backgroundChange';

interface UseBackgroundChangeResult {
  isGenerating: boolean;
  generationError: string | null;
  generatedImageUrl: string | null;
  jobStatus: BackgroundChangeJobStatus | null;
  generateBackgroundChange: (request: GenerateBackgroundChangeRequest) => Promise<void>;
  resetGeneration: () => void;
  setGeneratedImageUrl: (url: string | null) => void;
  insufficientCredits: { available: number; required: number } | null;
}

export function useBackgroundChange(): UseBackgroundChangeResult {
  // Use global generation store for state that persists across navigation
  const {
    isGenerating,
    error: generationError,
    generatedImageUrl,
    startGeneration,
    completeGeneration,
    failGeneration,
    resetGeneration: resetStore,
  } = useFeatureGeneration('backgroundchange');
  
  // Local state for transient UI
  const [jobStatus, setJobStatus] = useState<BackgroundChangeJobStatus | null>(null);
  const [insufficientCredits, setInsufficientCredits] = useState<{ available: number; required: number } | null>(null);

  const generateBackgroundChange = useCallback(async (request: GenerateBackgroundChangeRequest) => {
    try {
      startGeneration();
      setJobStatus(null);
      setInsufficientCredits(null);

      console.log('🎬 Starting background change generation...');
      
      // Call the API to generate background change
      const response = await backgroundChangeService.generateBackgroundChange(request);
      
      console.log('✅ Generation initiated:', response);

      // If we get an immediate image URL, use it
      if (response.imageUrl) {
        completeGeneration(response.imageUrl);
        return;
      }

      // If we have a job ID, poll for status
      if (response.jobId) {
        console.log('⏳ Polling job status for:', response.jobId);
        
        const finalStatus = await backgroundChangeService.pollJobStatus(
          response.jobId,
          (status) => {
            console.log('📊 Job status update:', status);
            setJobStatus(status);
          }
        );

        console.log('🏁 Final job status:', finalStatus);
        
        if (finalStatus.status === 'completed' && finalStatus.imageUrl) {
          completeGeneration(finalStatus.imageUrl);
          setJobStatus(finalStatus);
        } else if (finalStatus.status === 'failed') {
          failGeneration(finalStatus.error || 'Generation failed');
          setJobStatus(finalStatus);
        }
      } else {
        // No job ID or image URL - something went wrong
        failGeneration(response.message || 'Failed to start generation');
      }
    } catch (error) {
      console.error('❌ Error generating background change:', error);
      
      // Handle insufficient credits error specifically
      if (error instanceof InsufficientCreditsError) {
        setInsufficientCredits({
          available: error.creditsAvailable,
          required: error.creditsRequired,
        });
        failGeneration(''); // Clear generating state
      } else {
        failGeneration(error instanceof Error ? error.message : 'An error occurred');
      }
    }
  }, [startGeneration, completeGeneration, failGeneration]);

  const resetGeneration = useCallback(() => {
    resetStore();
    setJobStatus(null);
    setInsufficientCredits(null);
  }, [resetStore]);

  const setGeneratedImageUrl = useCallback((url: string | null) => {
    if (url) {
      completeGeneration(url);
    } else {
      resetStore();
    }
  }, [completeGeneration, resetStore]);

  return {
    isGenerating,
    generationError,
    generatedImageUrl,
    jobStatus,
    generateBackgroundChange,
    resetGeneration,
    setGeneratedImageUrl,
    insufficientCredits,
  };
}
