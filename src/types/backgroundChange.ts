/**
 * Background Change types
 * These types represent the data structure for background change generation
 */

/**
 * Individual photo data for background change
 * IMPORTANT: Backend expects 'id' field (lowercase) and it's required
 */
export interface BackgroundChangePhoto {
  id: string;    // Required - unique identifier for tracking
  image: string; // Base64 encoded image with data URI format
}

/**
 * Request payload for background change generation
 * IMPORTANT: Backend accepts backgroundId as string
 */
export interface GenerateBackgroundChangeRequest {
  photos: BackgroundChangePhoto[];
  backgroundId: string;
  prompt?: string; // Optional additional information/instructions from user
  aspectRatio?: string;
  resolution?: string;
}

/**
 * Response from background change generation API (Backend format)
 * Backend returns snake_case properties
 */
export interface GenerateBackgroundChangeResponseRaw {
  success: boolean;
  job_id?: string;
  image_url?: string;
  message?: string;
  estimated_time?: number;
  status?: 'processing' | 'completed' | 'failed';
  background_id?: number;
  photo_count?: number;
  generated_at?: string;
}

/**
 * Response from background change generation API (Frontend format)
 * Mapped to camelCase for frontend consumption
 */
export interface GenerateBackgroundChangeResponse {
  success: boolean;
  jobId?: string;
  imageUrl?: string;
  message?: string;
  estimatedTime?: number; // seconds
  status?: 'processing' | 'completed' | 'failed';
  backgroundId?: string; // Converted from backend number to string
  photoCount?: number;
  generatedAt?: string;
}

/**
 * Job status response for checking generation progress
 */
export interface BackgroundChangeJobStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number; // 0-100
  imageUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

/**
 * Background change generation history item
 */
export interface BackgroundChangeHistory {
  id: string;
  jobId: string;
  imageUrl: string;
  thumbnail?: string;
  photos: BackgroundChangePhoto[];
  backgroundId: string;
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
export interface BackgroundChangeHistoryResponse {
  count: number;
  history: BackgroundChangeHistory[];
}
