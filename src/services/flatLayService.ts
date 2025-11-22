/**
 * Flatlay Image Generation Service
 * Handles flatlay/image generation API requests with proper error handling and authentication
 */

import api from '../utils/apiClient';
import type {
  GenerateFlatLayRequest,
  GenerateFlatLayResponse,
  FlatLayJobStatus,
  FlatLayHistory,
  FlatLayHistoryResponse,
} from '../types/flatlay';

/**
 * FlatLayService - Singleton service for flatlay image generation
 */
class FlatLayService {
  private static instance: FlatLayService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): FlatLayService {
    if (!FlatLayService.instance) {
      FlatLayService.instance = new FlatLayService();
    }
    return FlatLayService.instance;
  }

  /**
   * Generate a flatlay image
   * @param request - The generation request payload
   * @returns Promise with generation response
   */
  public async generateFlatlay(
    request: GenerateFlatLayRequest
  ): Promise<GenerateFlatLayResponse> {
    try {
      // Log the request payload for debugging (with truncated images)
      console.log('🚀 Generating flatlay with request:', {
        productsCount: request.products.length,
        products: request.products.map(p => ({
          type: p.type,
          hasFrontImage: !!p.frontImage,
          hasBackImage: !!p.backImage,
          frontImagePreview: p.frontImage?.substring(0, 50),
          backImagePreview: p.backImage?.substring(0, 50),
        })),
        modelId: request.modelId,
        backgroundId: request.backgroundId,
        options: request.options,
      });

      // Log the FULL stringified payload structure (for debugging structure issues)
      const requestBody = JSON.stringify(request);
      console.log('📝 Full request body structure (first 500 chars):', requestBody.substring(0, 500));
      console.log('📊 Request body size:', requestBody.length, 'bytes');

      // Backend expects both modelId and backgroundId as strings
      // Convert backgroundId to string if it's a number
      const formattedRequest = {
        products: request.products,
        modelId: request.modelId,
        backgroundId: String(request.backgroundId), // Convert to string!
        aspectRatio: request.aspectRatio,
        resolution: request.resolution,
        options: request.options,
      };
      
      console.log('✅ Formatted request (backend expects strings):', {
        modelId: formattedRequest.modelId,
        backgroundId: formattedRequest.backgroundId,
        backgroundIdType: typeof formattedRequest.backgroundId,
        aspectRatio: formattedRequest.aspectRatio,
        resolution: formattedRequest.resolution,
      });

      // Add ?flatlay parameter to indicate request is from flatlay feature
      const response = await api.post('/v1/generate?flatlay', formattedRequest);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error Response:', errorData);
        throw new Error(
          errorData.message || `Failed to generate flatlay: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log('✅ Raw API Response:', data);
      
      // Map snake_case response to camelCase for frontend
      const mappedResponse: GenerateFlatLayResponse = {
        success: data.success,
        jobId: data.job_id,
        imageUrl: data.image_url,
        message: data.message,
        estimatedTime: data.estimated_time,
        status: data.status,
        modelId: data.model_id,
        backgroundId: data.background_id,
        productCount: data.product_count,
        generatedAt: data.generated_at,
      };
      
      console.log('🔄 Mapped Response:', mappedResponse);
      return mappedResponse;
    } catch (error) {
      console.error('Error generating flatlay:', error);
      throw error;
    }
  }

  /**
   * Check the status of a flatlay generation job
   * @param jobId - The job ID to check
   * @returns Promise with job status
   */
  public async getJobStatus(jobId: string): Promise<FlatLayJobStatus> {
    try {
      const response = await api.get(`/v1/flatlay/status/${jobId}`);

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
    onProgress?: (status: FlatLayJobStatus) => void,
    pollInterval: number = 2000,
    maxAttempts: number = 60
  ): Promise<FlatLayJobStatus> {
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
   * Get flatlay generation history
   * @param limit - Maximum number of items to retrieve
   * @param offset - Offset for pagination
   * @returns Promise with history response
   */
  public async getHistory(
    limit: number = 20,
    offset: number = 0
  ): Promise<FlatLayHistoryResponse> {
    try {
      const response = await api.get(
        `/v1/flatlay/history?limit=${limit}&offset=${offset}`
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
      console.error('Error fetching flatlay history:', error);
      throw error;
    }
  }

  /**
   * Get a specific flatlay generation by ID
   * @param id - The flatlay ID
   * @returns Promise with flatlay details
   */
  public async getFlatLayById(id: string): Promise<FlatLayHistory> {
    try {
      const response = await api.get(`/v1/flatlay/${id}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch flatlay: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching flatlay:', error);
      throw error;
    }
  }

  /**
   * Delete a flatlay from history
   * @param id - The flatlay ID to delete
   * @returns Promise with success status
   */
  public async deleteFlatLay(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.delete(`/v1/flatlay/${id}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to delete flatlay: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting flatlay:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const flatLayService = FlatLayService.getInstance();
