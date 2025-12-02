/**
 * On-Model Photos Generation types
 * These types represent the data structure for on-model photo generation
 */

/**
 * Individual model photo data
 * IMPORTANT: Backend expects 'id' field (lowercase) and it's required
 */
export interface ModelPhoto {
  id: string;    // Required - unique identifier for tracking
  image: string; // Base64 encoded image with data URI format
}

/**
 * Request payload for on-model photo generation
 * IMPORTANT: Backend accepts modelId and backgroundId as strings
 * Backend does NOT accept options field - it's removed in service before sending
 */
export interface GenerateOnModelRequest {
  photos: ModelPhoto[];
  modelId: string;
  backgroundId?: string; // Optional - if not provided, original background is kept
  aspectRatio?: string; // e.g., 'auto', '1:1', '16:9', etc.
  resolution?: string; // e.g., '1K', '2K', '4K'
  prompt?: string; // Optional prompt for additional instructions
}

/**
 * Response from on-model photo generation API (Backend format)
 * Backend returns snake_case properties
 */
export interface GenerateOnModelResponseRaw {
  success: boolean;
  job_id?: string;
  image_url?: string;
  message?: string;
  estimated_time?: number;
  status?: 'processing' | 'completed' | 'failed';
  model_id?: number;
  background_id?: number;
  photo_count?: number;
  generated_at?: string;
}

/**
 * Response from on-model photo generation API (Frontend format)
 * Mapped to camelCase for frontend consumption
 */
export interface GenerateOnModelResponse {
  success: boolean;
  jobId?: string;
  imageUrl?: string;
  message?: string;
  estimatedTime?: number; // seconds
  status?: 'processing' | 'completed' | 'failed';
  modelId?: string; // Converted from backend number to string
  backgroundId?: string; // Converted from backend number to string
  photoCount?: number;
  generatedAt?: string;
}

/**
 * Job status response for checking generation progress
 */
export interface OnModelJobStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number; // 0-100
  imageUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

/**
 * On-model generation history item
 */
export interface OnModelHistory {
  id: string;
  jobId: string;
  imageUrl: string;
  thumbnail?: string;
  photos: ModelPhoto[];
  modelId: string;
  backgroundId: string; // Always string for consistency
  createdAt: string;
  metadata?: {
    quality: string;
    format: string;
    resolution: {
      width: number;
      height: number;
    };
  };
}

/**
 * Response for fetching generation history
 */
export interface OnModelHistoryResponse {
  count: number;
  history: OnModelHistory[];
}
