/**
 * On-Model Photos Generation Service
 * Handles on-model photo generation API requests with proper error handling and authentication
 */

import api from '../utils/apiClient';
import { InsufficientCreditsError } from '../types/errors';
import { logger } from '@/utils/logger';
import type {
  GenerateOnModelRequest,
  GenerateOnModelResponse,
  OnModelJobStatus,
  OnModelHistory,
  OnModelHistoryResponse,
} from '../types/onModel';

/**
 * OnModelPhotosService - Singleton service for on-model photo generation
 */
class OnModelPhotosService {
  private static instance: OnModelPhotosService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): OnModelPhotosService {
    if (!OnModelPhotosService.instance) {
      OnModelPhotosService.instance = new OnModelPhotosService();
    }
    return OnModelPhotosService.instance;
  }

  /**
   * Generate on-model photos
   * @param request - The generation request payload
   * @returns Promise with generation response
   */
  public async generateOnModel(
    request: GenerateOnModelRequest
  ): Promise<GenerateOnModelResponse> {
    try {
      // Validate input request
      if (!request || !request.photos || !Array.isArray(request.photos)) {
        throw new Error('Invalid request: photos array is required');
      }

      if (!request.modelId) {
        throw new Error('Invalid request: modelId is required');
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
      logger.debug('Generating on-model photos', {
        context: 'OnModelService',
        data: {
          photosCount: request.photos.length,
          photos: request.photos.map(p => ({
            id: p.id,
            hasImage: !!p.image,
            imagePreview: p.image?.substring(0, 50),
          })),
          modelId: request.modelId,
          backgroundId: request.backgroundId,
        },
      });

      // Backend expects simple structure: { photos, modelId, backgroundId (optional), aspectRatio, resolution }
      // Each photo must have id (string) and image (base64 data URI)
      const payload = {
        photos: request.photos.map(photo => ({
          id: String(photo.id), // Ensure ID is string
          image: photo.image,
        })),
        modelId: String(request.modelId), // Ensure string
        ...(request.backgroundId && { backgroundId: String(request.backgroundId) }), // Include only if provided
        aspectRatio: request.aspectRatio,
        resolution: request.resolution,
      };
      
      logger.debug('Payload structure validated', {
        context: 'OnModelService',
        data: {
          photosCount: payload.photos.length,
          modelId: payload.modelId,
          backgroundId: payload.backgroundId,
          aspectRatio: payload.aspectRatio,
          resolution: payload.resolution,
          firstPhoto: {
            id: payload.photos[0]?.id,
            hasImage: !!payload.photos[0]?.image,
            imageLength: payload.photos[0]?.image?.length || 0,
          },
        },
      });

      // Add ?onmodel parameter to indicate request is from on-model feature
      const response = await api.post('/v1/generate?onmodel', payload);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.apiError('/v1/generate?onmodel', errorData);
        
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
          errorData.message || `Failed to generate on-model photos: ${response.statusText}`
        );
      }

      const data = await response.json();
      logger.apiResponse('/v1/generate?onmodel', response.status, data);
      
      // Map snake_case response to camelCase for frontend
      const mappedResponse: GenerateOnModelResponse = {
        success: data.success,
        jobId: data.job_id, // May be undefined for synchronous responses
        imageUrl: data.image_url,
        message: data.message,
        estimatedTime: data.estimated_time,
        status: data.status,
        modelId: String(data.model_id), // Backend returns number, convert to string
        backgroundId: String(data.background_id), // Backend returns number, convert to string
        photoCount: data.photo_count,
        generatedAt: data.generated_at,
      };
      
      logger.debug('Mapped response', { context: 'OnModelService', data: mappedResponse });
      return mappedResponse;
    } catch (error) {
      logger.error('Error generating on-model photos', { context: 'OnModelService', data: error });
      throw error;
    }
  }

  /**
   * Check the status of an on-model generation job
   * @param jobId - The job ID to check
   * @returns Promise with job status
   */
  public async getJobStatus(jobId: string): Promise<OnModelJobStatus> {
    try {
      const response = await api.get(`/v1/onmodel/status/${jobId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch job status: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.apiError(`/v1/onmodel/status/${jobId}`, error);
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
    onProgress?: (status: OnModelJobStatus) => void,
    pollInterval: number = 2000,
    maxAttempts: number = 60
  ): Promise<OnModelJobStatus> {
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
   * Get on-model generation history
   * @param limit - Maximum number of items to retrieve
   * @param offset - Offset for pagination
   * @returns Promise with history response
   */
  public async getHistory(
    limit: number = 20,
    offset: number = 0
  ): Promise<OnModelHistoryResponse> {
    try {
      const response = await api.get(
        `/v1/onmodel/history?limit=${limit}&offset=${offset}`
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
      logger.apiError('/v1/onmodel/history', error);
      throw error;
    }
  }

  /**
   * Get a specific on-model generation by ID
   * @param id - The on-model ID
   * @returns Promise with on-model details
   */
  public async getOnModelById(id: string): Promise<OnModelHistory> {
    try {
      const response = await api.get(`/v1/onmodel/${id}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch on-model: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.apiError(`/v1/onmodel/${id}`, error);
      throw error;
    }
  }

  /**
   * Delete an on-model from history
   * @param id - The on-model ID to delete
   * @returns Promise with success status
   */
  public async deleteOnModel(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.delete(`/v1/onmodel/${id}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to delete on-model: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.apiError(`/v1/onmodel/${id}`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const onModelPhotosService = OnModelPhotosService.getInstance();
