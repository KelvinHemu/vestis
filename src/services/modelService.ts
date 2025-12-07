import type { ModelsResponse, Model, AgeRange } from '../types/model';
import api from '../utils/apiClient';

/**
 * ModelService handles all model-related API calls
 */
class ModelService {
  /**
   * Fetch all models from the API
   * @returns Promise with models response containing count and models array
   */
  async getModels(): Promise<ModelsResponse> {
    try {
      const response = await api.get('/v1/models');

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch models');
      }

      const data: ModelsResponse = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetch models filtered by gender
   * @param gender - Filter models by male or female
   * @returns Promise with filtered models
   */
  async getModelsByGender(gender: 'male' | 'female'): Promise<Model[]> {
    try {
      const response = await this.getModels();
      return response.models.filter(model => model.gender === gender && model.status === 'active');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a single model by ID
   * @param id - The model ID
   * @returns Promise with the model data
   */
  async getModelById(id: number): Promise<Model | null> {
    try {
      const response = await this.getModels();
      const model = response.models.find(m => m.id === id);
      return model || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get model image by position
   * @param model - The model object
   * @param position - Image position (1, 2, 3, or 4)
   * @returns The image URL or undefined if not found
   */
  getModelImageByPosition(model: Model, position: number): string | undefined {
    if (!model.images || !Array.isArray(model.images)) {
      return undefined;
    }
    const image = model.images.find(img => img.position === position);
    return image?.url;
  }

  /**
   * Get the main/portrait image for a model (position 2)
   * @param model - The model object
   * @returns The main image URL or undefined
   */
  getMainImage(model: Model): string | undefined {
    return this.getModelImageByPosition(model, 2);
  }

  /**
   * Get all images for a model sorted by position
   * @param model - The model object
   * @returns Array of image URLs sorted by position
   */
  getAllImages(model: Model): string[] {
    if (!model.images || !Array.isArray(model.images)) {
      return [];
    }
    return model.images
      .sort((a, b) => a.position - b.position)
      .map(img => img.url);
  }

  /**
   * Format age range for display
   * @param ageRange - The age range object
   * @returns Formatted age range string (e.g., "18-25")
   */
  formatAgeRange(ageRange: AgeRange): string {
    return `${ageRange.min}-${ageRange.max}`;
  }
}

// Export singleton instance
export default new ModelService();

