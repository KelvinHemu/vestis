/**
 * Custom Model Service
 * 
 * Handles all API operations for business-specific custom models.
 * These models are private to each business and only visible to them.
 */

import type {
  CustomModel,
  CreateCustomModelRequest,
  CustomModelsResponse
} from '@/types/model';
import api from '@/utils/apiClient';
import { logger } from '@/utils/logger';

// ============================================================================
// Custom Model Service Class
// ============================================================================

class CustomModelService {

  /**
   * Fetch all custom models for the current user's business
   * Backend automatically filters by authenticated user
   */
  async getCustomModels(): Promise<CustomModelsResponse> {
    try {
      logger.info('[CustomModelService] Fetching custom models...');

      const response = await api.get('/v1/custom-models');

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch custom models');
      }

      const data: CustomModelsResponse = await response.json();
      logger.info(`[CustomModelService] Fetched ${data.models.length} custom models`);

      return data;
    } catch (error) {
      logger.error('[CustomModelService] Error fetching custom models:', { data: error });
      throw error;
    }
  }

  /**
   * Fetch custom models filtered by gender
   */
  async getCustomModelsByGender(gender: 'male' | 'female'): Promise<CustomModel[]> {
    try {
      const response = await this.getCustomModels();
      return response.models.filter(model => model.gender === gender);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new custom model
   * Super simple: just name, gender, and image
   */
  async createCustomModel(data: CreateCustomModelRequest): Promise<CustomModel> {
    try {
      logger.info('[CustomModelService] Creating custom model:', { data: data.name });

      const response = await api.post('/v1/custom-models', data);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create custom model');
      }

      const result = await response.json();
      logger.info('[CustomModelService] Custom model created successfully:', { data: result.id });

      return result;
    } catch (error) {
      logger.error('[CustomModelService] Error creating custom model:', { data: error });
      throw error;
    }
  }

  /**
   * Delete a custom model by ID
   */
  async deleteCustomModel(modelId: number): Promise<void> {
    try {
      logger.info('[CustomModelService] Deleting custom model:', { data: modelId });

      const response = await api.delete(`/v1/custom-models/${modelId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete custom model');
      }

      logger.info('[CustomModelService] Custom model deleted successfully');
    } catch (error) {
      logger.error('[CustomModelService] Error deleting custom model:', { data: error });
      throw error;
    }
  }

  /**
   * Update a custom model (name or image)
   */
  async updateCustomModel(
    modelId: number,
    data: Partial<CreateCustomModelRequest>
  ): Promise<CustomModel> {
    try {
      logger.info('[CustomModelService] Updating custom model:', { data: modelId });

      const response = await api.put(`/v1/custom-models/${modelId}`, data);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update custom model');
      }

      const result = await response.json();
      logger.info('[CustomModelService] Custom model updated successfully');

      return result;
    } catch (error) {
      logger.error('[CustomModelService] Error updating custom model:', { data: error });
      throw error;
    }
  }
}

// Export singleton instance
export default new CustomModelService();



