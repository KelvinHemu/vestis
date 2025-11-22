import { useState, useCallback } from 'react';
import { onModelPhotosService } from '../services/onModelPhotosService';
import type { GenerateOnModelRequest, GenerateOnModelResponse, OnModelJobStatus } from '../types/onModel';

interface UseOnModelGenerationResult {
  isGenerating: boolean;
  generationError: string | null;
  generatedImageUrl: string | null;
  jobStatus: OnModelJobStatus | null;
  generateOnModel: (request: GenerateOnModelRequest) => Promise<void>;
  resetGeneration: () => void;
  setGeneratedImageUrl: (url: string | null) => void;
}

export function useOnModelGeneration(): UseOnModelGenerationResult {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<OnModelJobStatus | null>(null);

  const generateOnModel = useCallback(async (request: GenerateOnModelRequest) => {
    try {
      setIsGenerating(true);
      setGenerationError(null);
      setGeneratedImageUrl(null);
      setJobStatus(null);

      console.log('🎬 Starting on-model generation...');
      
      // Call the API to generate on-model photos
      const response: GenerateOnModelResponse = await onModelPhotosService.generateOnModel(request);
      
      console.log('✅ Generation initiated:', response);

      // If we get an immediate image URL, use it
      if (response.imageUrl) {
        setGeneratedImageUrl(response.imageUrl);
        setIsGenerating(false);
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
          setGeneratedImageUrl(finalStatus.imageUrl);
          setJobStatus(finalStatus);
        } else if (finalStatus.status === 'failed') {
          setGenerationError(finalStatus.error || 'Generation failed');
          setJobStatus(finalStatus);
        }
      } else {
        // No job ID or image URL - something went wrong
        setGenerationError(response.message || 'Failed to start generation');
      }
    } catch (error) {
      console.error('❌ Error generating on-model photos:', error);
      setGenerationError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const resetGeneration = useCallback(() => {
    setIsGenerating(false);
    setGenerationError(null);
    setGeneratedImageUrl(null);
    setJobStatus(null);
  }, []);

  return {
    isGenerating,
    generationError,
    generatedImageUrl,
    jobStatus,
    generateOnModel,
    resetGeneration,
    setGeneratedImageUrl,
  };
}
