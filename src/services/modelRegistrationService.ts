import type { 
  SelfRegisteredModel, 
  ModelRegistrationData,
  ImageUploadData,
  ModelImage 
} from '../types/model';
import api from '../utils/apiClient';

/**
 * Response interfaces
 */
interface ModelResponse {
  model: SelfRegisteredModel;
}

interface ImageResponse {
  image: ModelImage;
}

interface PendingModelsResponse {
  models: SelfRegisteredModel[];
}

/**
 * ModelRegistrationService handles model self-registration API calls
 */
class ModelRegistrationService {
  /**
   * Register current user as a model
   */
  async register(data: ModelRegistrationData): Promise<SelfRegisteredModel> {
    const response = await api.post('/v1/models/register', data);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Registration failed');
    }

    const result: ModelResponse = await response.json();
    return result.model;
  }

  /**
   * Get current user's model profile
   */
  async getMyProfile(): Promise<SelfRegisteredModel | null> {
    const response = await api.get('/v1/models/my-profile');

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to fetch profile');
    }

    const result: ModelResponse = await response.json();
    return result.model;
  }

  /**
   * Update current user's model profile
   */
  async updateProfile(data: Partial<ModelRegistrationData>): Promise<SelfRegisteredModel> {
    const response = await api.put('/v1/models/my-profile', data);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Update failed');
    }

    const result: ModelResponse = await response.json();
    return result.model;
  }

  /**
   * Upload model profile image
   */
  async uploadImage(data: ImageUploadData): Promise<ModelImage> {
    const response = await api.post('/v1/models/my-profile/images', data);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Upload failed');
    }

    const result: ImageResponse = await response.json();
    return result.image;
  }

  /**
   * Admin: Get all pending model registrations
   */
  async getPendingModels(): Promise<SelfRegisteredModel[]> {
    const response = await api.get('/v1/admin/models/pending');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to fetch pending models');
    }

    const result: PendingModelsResponse = await response.json();
    return result.models;
  }

  /**
   * Admin: Approve a model registration
   */
  async approveModel(modelId: number): Promise<void> {
    const response = await api.put(`/v1/admin/models/${modelId}/approve`, {});

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Approval failed');
    }
  }

  /**
   * Admin: Reject a model registration
   */
  async rejectModel(modelId: number, reason: string): Promise<void> {
    const response = await api.put(`/v1/admin/models/${modelId}/reject`, { reason });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Rejection failed');
    }
  }
}

// Export singleton instance
export default new ModelRegistrationService();
