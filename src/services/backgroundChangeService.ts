/**
 * Background Change Service
 * Handles background change API requests with proper error handling and authentication
 */

import api from '../utils/apiClient';
import { InsufficientCreditsError } from '../types/errors';
import { logger } from '@/utils/logger';
import type {
  GenerateBackgroundChangeRequest,
  GenerateBackgroundChangeResponse,
  BackgroundChangeJobStatus,
  BackgroundChangeHistory,
  BackgroundChangeHistoryResponse,
} from '../types/backgroundChange';

/**
 * BackgroundChangeService - Singleton service for background change generation
 */
class BackgroundChangeService {
  private static instance: BackgroundChangeService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): BackgroundChangeService {
    if (!BackgroundChangeService.instance) {
      BackgroundChangeService.instance = new BackgroundChangeService();
    }
    return BackgroundChangeService.instance;
  }

  /**
   * Generate background change
   * @param request - The generation request payload
   * @returns Promise with generation response
   */
  public async generateBackgroundChange(
    request: GenerateBackgroundChangeRequest
  ): Promise<GenerateBackgroundChangeResponse> {
    try {
      // Validate input request
      if (!request || !request.photos || !Array.isArray(request.photos)) {
        throw new Error('Invalid request: photos array is required');
      }

      if (!request.backgroundId) {
        throw new Error('Invalid request: backgroundId is required');
      }

      // Validate photos have required fields
      const invalidPhotos = request.photos.filter(p => !p.id || !p.image);
      if (invalidPhotos.length > 0) {
        throw new Error('All photos must have id and image fields');
      }

      // Validate that images are base64 data URIs
      const invalidImages = request.photos.filter(
        p => !p.image.startsWith('data:image/')
      );
      if (invalidImages.length > 0) {
        throw new Error('All images must be base64 data URIs starting with "data:image/"');
      }

      // Log the request payload for debugging (with truncated images)
      console.log('🚀 Generating background change with request:', {
        photosCount: request.photos.length,
        photos: request.photos.map(p => ({
          id: p.id,
          hasImage: !!p.image,
          imagePreview: p.image?.substring(0, 50),
        })),
        backgroundId: request.backgroundId,
      });

      // Backend expects simple structure: { photos, backgroundId, prompt?, aspectRatio?, resolution? }
      // Each photo must have id (string) and image (base64 data URI)
      const payload = {
        photos: request.photos.map(photo => ({
          id: String(photo.id), // Ensure ID is string
          image: photo.image,
        })),
        backgroundId: String(request.backgroundId), // Ensure string
        ...(request.prompt && { prompt: request.prompt }), // Include prompt if provided
        ...(request.aspectRatio && { aspectRatio: request.aspectRatio }), // Include aspect ratio if provided
        ...(request.resolution && { resolution: request.resolution }), // Include resolution if provided
      };
      
      console.log('✅ Payload structure validated:', {
        photosCount: payload.photos.length,
        backgroundId: payload.backgroundId,
        firstPhoto: {
          id: payload.photos[0]?.id,
          hasImage: !!payload.photos[0]?.image,
          imageLength: payload.photos[0]?.image?.length || 0,
        },
      });

      // Add ?background parameter to indicate request is from background change feature
      const response = await api.post('/v1/generate?background', payload);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error Response:', errorData);
        
        // Handle 402 Payment Required - Insufficient Credits
        if (response.status === 402) {
          const creditsAvailable = errorData.credits_available || 0;
          const creditsRequired = errorData.credits_required || 1;
          throw new InsufficientCreditsError(
            creditsAvailable,
            creditsRequired,
            errorData.error || errorData.message
          );
        }
        
        throw new Error(
          errorData.message || `Failed to generate background change: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log('✅ Raw API Response:', data);
      
      // Map snake_case response to camelCase for frontend
      const mappedResponse: GenerateBackgroundChangeResponse = {
        success: data.success,
        jobId: data.job_id, // May be undefined for synchronous responses
        imageUrl: data.image_url,
        message: data.message,
        estimatedTime: data.estimated_time,
        status: data.status,
        backgroundId: String(data.background_id), // Backend returns number, convert to string
        photoCount: data.photo_count,
        generatedAt: data.generated_at,
      };
      
      console.log('🔄 Mapped Response:', mappedResponse);
      return mappedResponse;
    } catch (error) {
      console.error('Error generating background change:', error);
      throw error;
    }
  }

  /**
   * Check the status of a background change generation job
   * @param jobId - The job ID to check
   * @returns Promise with job status
   */
  public async getJobStatus(jobId: string): Promise<BackgroundChangeJobStatus> {
    try {
      const response = await api.get(`/v1/background-change/status/${jobId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch job status: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching job status:', error);
      throw error;
    }
  }

  /**
   * Poll job status until completion or failure
   * @param jobId - The job ID to poll
   * @param onProgress - Optional callback for progress updates
   * @param pollInterval - Polling interval in milliseconds (default: 2000)
   * @param maxAttempts - Maximum polling attempts (default: 60)
   * @returns Promise with final job status
   */
  public async pollJobStatus(
    jobId: string,
    onProgress?: (status: BackgroundChangeJobStatus) => void,
    pollInterval: number = 2000,
    maxAttempts: number = 60
  ): Promise<BackgroundChangeJobStatus> {
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          attempts++;

          if (attempts > maxAttempts) {
            reject(new Error('Job status polling timeout'));
            return;
          }

          const status = await this.getJobStatus(jobId);

          // Call progress callback if provided
          if (onProgress) {
            onProgress(status);
          }

          // Check if job is completed or failed
          if (status.status === 'completed' || status.status === 'failed') {
            resolve(status);
            return;
          }

          // Continue polling
          setTimeout(poll, pollInterval);
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  /**
   * Get background change generation history
   * @param limit - Maximum number of items to retrieve
   * @param offset - Offset for pagination
   * @returns Promise with history response
   */
  public async getHistory(
    limit: number = 20,
    offset: number = 0
  ): Promise<BackgroundChangeHistoryResponse> {
    try {
      const response = await api.get(
        `/v1/background-change/history?limit=${limit}&offset=${offset}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch history: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching background change history:', error);
      throw error;
    }
  }

  /**
   * Get a specific background change generation by ID
   * @param id - The background change ID
   * @returns Promise with background change details
   */
  public async getBackgroundChangeById(id: string): Promise<BackgroundChangeHistory> {
    try {
      const response = await api.get(`/v1/background-change/${id}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch background change: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching background change:', error);
      throw error;
    }
  }

  /**
   * Delete a background change from history
   * @param id - The background change ID to delete
   * @returns Promise with success status
   */
  public async deleteBackgroundChange(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.delete(`/v1/background-change/${id}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to delete background change: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting background change:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const backgroundChangeService = BackgroundChangeService.getInstance();
