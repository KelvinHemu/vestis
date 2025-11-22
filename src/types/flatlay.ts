/**
 * Flatlay/Image Generation types
 * These types represent the data structure for flatlay image generation
 */

/**
 * Product type for flatlay generation
 */
export type ProductType = 'top' | 'bottom' | 'fullbody';

/**
 * Individual product image data
 */
export interface ProductImage {
  type: ProductType;
  frontImage?: string; // Base64 or URL
  backImage?: string;  // Base64 or URL
}

/**
 * Request payload for flatlay image generation
 * Note: Both modelId and backgroundId will be converted to strings before sending to backend
 */
export interface GenerateFlatLayRequest {
  products: ProductImage[];
  modelId: string;
  backgroundId: string | number; // Will be converted to string in service
  aspectRatio?: string; // e.g., 'auto', '1:1', '16:9', etc.
  resolution?: string; // e.g., '1K', '2K', '4K'
  options?: {
    quality?: 'low' | 'medium' | 'high';
    format?: 'png' | 'jpg' | 'webp';
    resolution?: {
      width: number;
      height: number;
    };
  };
}

/**
 * Response from flatlay image generation API (Backend format)
 * Backend returns snake_case properties
 */
export interface GenerateFlatLayResponseRaw {
  success: boolean;
  job_id?: string;
  image_url?: string;
  message?: string;
  estimated_time?: number;
  status?: 'processing' | 'completed' | 'failed';
  model_id?: number;
  background_id?: number;
  product_count?: number;
  generated_at?: string;
}

/**
 * Response from flatlay image generation API (Frontend format)
 * Mapped to camelCase for frontend consumption
 */
export interface GenerateFlatLayResponse {
  success: boolean;
  jobId?: string;
  imageUrl?: string;
  message?: string;
  estimatedTime?: number; // seconds
  status?: 'processing' | 'completed' | 'failed';
  modelId?: number;
  backgroundId?: number;
  productCount?: number;
  generatedAt?: string;
}

/**
 * Job status response for checking generation progress
 */
export interface FlatLayJobStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number; // 0-100
  imageUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

/**
 * Flatlay generation history item
 */
export interface FlatLayHistory {
  id: string;
  jobId: string;
  imageUrl: string;
  thumbnail?: string;
  products: ProductImage[];
  modelId: string;
  backgroundId: string | number;
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
export interface FlatLayHistoryResponse {
  count: number;
  history: FlatLayHistory[];
}
