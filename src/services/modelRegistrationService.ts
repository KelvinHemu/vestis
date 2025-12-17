import type { 
  SelfRegisteredModel, 
  ModelRegistrationData,
  ImageUploadData,
  ModelImage 
} from '../types/model';
import api from '../utils/apiClient';

type FieldErrors = Record<string, string>;

class ApiRequestError extends Error {
  status: number;
  fieldErrors?: FieldErrors;
  data?: unknown;

  constructor(params: { message: string; status: number; fieldErrors?: FieldErrors; data?: unknown }) {
    super(params.message);
    this.name = 'ApiRequestError';
    this.status = params.status;
    this.fieldErrors = params.fieldErrors;
    this.data = params.data;
  }
}

function sanitizeRegistrationPayload(data: ModelRegistrationData): ModelRegistrationData {
  // Measurement fields to exclude (commented out in UI, should not be sent)
  const measurementFields = [
    'height_cm', 'waist_cm', 'hips_cm', 'bust_cm', 'chest_cm',
    'shoulder_width_cm', 'inseam_cm', 'neck_cm', 'shoe_size_eu',
    'eye_color', 'hair_color', 'clothing_size'
  ];

  // Backend validates "if provided" fields; avoid sending empty strings.
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    // Skip measurement fields entirely
    if (measurementFields.includes(key)) continue;
    
    if (value === undefined || value === null) continue;

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length === 0) continue;
      cleaned[key] = trimmed;
      continue;
    }

    cleaned[key] = value;
  }
  return cleaned as ModelRegistrationData;
}

async function readErrorPayload(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return undefined;
    }
  }

  try {
    const text = await response.text();
    if (!text) return undefined;
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  } catch {
    return undefined;
  }
}

function extractFieldErrors(payload: any): FieldErrors | undefined {
  // Vestis backend pattern (from docs): { error: { field: "message" } }
  if (payload?.error && typeof payload.error === 'object' && !Array.isArray(payload.error)) {
    const errors: FieldErrors = {};
    for (const [key, value] of Object.entries(payload.error)) {
      if (typeof value === 'string') errors[key] = value;
      else if (value != null) errors[key] = JSON.stringify(value);
    }
    return Object.keys(errors).length ? errors : undefined;
  }

  // Common FastAPI/Pydantic pattern: { detail: [{ loc: [...], msg: "..." }] }
  if (Array.isArray(payload?.detail)) {
    const errors: FieldErrors = {};
    for (const item of payload.detail) {
      const loc = Array.isArray(item?.loc) ? item.loc : [];
      const field = typeof loc[loc.length - 1] === 'string' ? loc[loc.length - 1] : 'submit';
      const msg = typeof item?.msg === 'string' ? item.msg : 'Invalid value';
      errors[field] = msg;
    }
    return Object.keys(errors).length ? errors : undefined;
  }

  return undefined;
}

function toErrorMessage(payload: any, fieldErrors?: FieldErrors): string {
  if (typeof payload?.message === 'string' && payload.message.trim()) return payload.message;
  if (typeof payload?.error === 'string' && payload.error.trim()) return payload.error;
  if (fieldErrors && Object.keys(fieldErrors).length) return 'Please fix the highlighted fields.';
  return 'Request failed';
}

async function throwApiError(response: Response): Promise<never> {
  const payload = await readErrorPayload(response);
  const fieldErrors = extractFieldErrors(payload);
  const message = toErrorMessage(payload, fieldErrors);
  throw new ApiRequestError({ message, status: response.status, fieldErrors, data: payload });
}

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
    const response = await api.post('/v1/models/register', sanitizeRegistrationPayload(data));

    if (!response.ok) {
      await throwApiError(response);
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
    // Same empty-string sanitization when users clear optional fields.
    const sanitized = sanitizeRegistrationPayload(data as ModelRegistrationData);
    const response = await api.put('/v1/models/my-profile', sanitized);

    if (!response.ok) {
      await throwApiError(response);
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
      await throwApiError(response);
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
      await throwApiError(response);
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
      await throwApiError(response);
    }
  }

  /**
   * Admin: Reject a model registration
   */
  async rejectModel(modelId: number, reason: string): Promise<void> {
    const response = await api.put(`/v1/admin/models/${modelId}/reject`, { reason });

    if (!response.ok) {
      await throwApiError(response);
    }
  }
}

// Export singleton instance
export default new ModelRegistrationService();
