import { useState, useCallback } from 'react';
import { onModelPhotosService } from '../services/onModelPhotosService';
import { InsufficientCreditsError } from '../types/errors';
import { useFeatureGeneration } from '../contexts/generationStore';
import type { GenerateOnModelRequest, OnModelJobStatus } from '../types/onModel';

interface UseOnModelGenerationResult {
  isGenerating: boolean;
  generationError: string | null;
  generatedImageUrl: string | null;
  jobStatus: OnModelJobStatus | null;
  generateOnModel: (request: GenerateOnModelRequest) => Promise<void>;
  resetGeneration: () => void;
  setGeneratedImageUrl: (url: string | null) => void;
  insufficientCredits: { available: number; required: number } | null;
}

export function useOnModelGeneration(): UseOnModelGenerationResult {
  // Use global generation store for state that persists across navigation
  const {
    isGenerating,
    error: generationError,
    generatedImageUrl,
    startGeneration,
    completeGeneration,
    failGeneration,
    resetGeneration: resetStore,
  } = useFeatureGeneration('onmodel');
  
  // Local state for transient UI
  const [jobStatus, setJobStatus] = useState<OnModelJobStatus | null>(null);
  const [insufficientCredits, setInsufficientCredits] = useState<{ available: number; required: number } | null>(null);

  const generateOnModel = useCallback(async (request: GenerateOnModelRequest) => {
    try {
      startGeneration();
      setJobStatus(null);
      setInsufficientCredits(null);

      console.log('🎬 Starting on-model generation...');
      
      // Call the API to generate on-model photos
      const response = await onModelPhotosService.generateOnModel(request);
      
      console.log('✅ Generation initiated:', response);

      // If we get an immediate image URL, use it
      if (response.imageUrl) {
        completeGeneration(response.imageUrl);
        return;
      }

      // If we have a job ID, poll for status
      if (response.jobId) {
        console.log('⏳ Polling job status for:', response.jobId);
        
        const finalStatus = await onModelPhotosService.pollJobStatus(
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
      console.error('❌ Error generating on-model photos:', error);
      
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
    generateOnModel,
    resetGeneration,
    setGeneratedImageUrl,
    insufficientCredits,
  };
}
