/**
 * Chat Generation Service
 * Handles chat-based generation API requests with proper error handling and authentication
 */

import api from '../utils/apiClient';
import { InsufficientCreditsError } from '../types/errors';

export interface ChatGenerationRequest {
  prompt: string;
  images?: string[]; // Image URLs or base64 encoded images
}

export interface ChatGenerationResponse {
  success: boolean;
  jobId: string;
  imageUrl?: string;
  message?: string;
  estimatedTime?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generatedAt?: string;
}

/**
 * ChatService - Service for chat-based image generation
 */
class ChatService {
  private static instance: ChatService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  /**
   * Generate image from chat prompt
   * @param request - The generation request with prompt and optional images
   * @returns Promise with generation response
   */
  public async generate(
    request: ChatGenerationRequest
  ): Promise<ChatGenerationResponse> {
    try {
      console.log('🚀 Generating from chat with prompt:', {
        prompt: request.prompt,
        imagesCount: request.images?.length || 0,
      });

      const response = await api.post('/v1/generate?chat=true', {
        prompt: request.prompt,
        images: request.images || [],
      });

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
          errorData.message || `Failed to generate: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log('✅ Raw API Response:', data);
      
      // Map snake_case response to camelCase for frontend
      const mappedResponse: ChatGenerationResponse = {
        success: data.success,
        jobId: data.job_id || data.jobId,
        imageUrl: data.image_url || data.imageUrl,
        message: data.message,
        estimatedTime: data.estimated_time || data.estimatedTime,
        status: data.status,
        generatedAt: data.generated_at || data.generatedAt,
      };
      
      console.log('🔄 Mapped Response:', mappedResponse);
      return mappedResponse;
    } catch (error) {
      console.error('Error generating from chat:', error);
      throw error;
    }
  }

  /**
   * Edit an existing generated image with a new prompt
   * This method specifically handles iterative editing by including the source image
   * @param sourceImage - The image URL to edit
   * @param prompt - The edit instruction/prompt
   * @param additionalImages - Optional additional images to include
   * @returns Promise with generation response
   */
  public async editImage(
    sourceImage: string,
    prompt: string,
    additionalImages: string[] = []
  ): Promise<ChatGenerationResponse> {
    try {
      console.log('✏️ Editing image with prompt:', {
        prompt,
        hasSourceImage: !!sourceImage,
        additionalImagesCount: additionalImages.length,
      });

      // Source image comes first, followed by any additional images
      const images = [sourceImage, ...additionalImages];

      return await this.generate({
        prompt,
        images,
      });
    } catch (error) {
      console.error('Error editing image:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const chatService = ChatService.getInstance();
