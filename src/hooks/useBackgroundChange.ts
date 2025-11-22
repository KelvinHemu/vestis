import { useState, useCallback } from 'react';
import { backgroundChangeService } from '../services/backgroundChangeService';
import type { GenerateBackgroundChangeRequest, GenerateBackgroundChangeResponse, BackgroundChangeJobStatus } from '../types/backgroundChange';

interface UseBackgroundChangeResult {
  isGenerating: boolean;
  generationError: string | null;
  generatedImageUrl: string | null;
  jobStatus: BackgroundChangeJobStatus | null;
  generateBackgroundChange: (request: GenerateBackgroundChangeRequest) => Promise<void>;
  resetGeneration: () => void;
  setGeneratedImageUrl: (url: string | null) => void;
}

export function useBackgroundChange(): UseBackgroundChangeResult {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<BackgroundChangeJobStatus | null>(null);

  const generateBackgroundChange = useCallback(async (request: GenerateBackgroundChangeRequest) => {
    try {
      setIsGenerating(true);
      setGenerationError(null);
      setGeneratedImageUrl(null);
      setJobStatus(null);

      console.log('🎬 Starting background change generation...');
      
      // Call the API to generate background change
      const response: GenerateBackgroundChangeResponse = await backgroundChangeService.generateBackgroundChange(request);
      
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
        
        const finalStatus = await backgroundChangeService.pollJobStatus(
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
      console.error('❌ Error generating background change:', error);
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
    generateBackgroundChange,
    resetGeneration,
    setGeneratedImageUrl,
  };
}
