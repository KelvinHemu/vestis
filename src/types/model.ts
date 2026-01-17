/**
 * Model data types
 * These types represent the model data structure from the API
 */

import { z } from 'zod';

export type RegistrationStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';
export type ClothingSize = 'S' | 'S-M' | 'S-L' | 'M-L' | 'L-XL' | 'L-XXL' | 'XXL';

export interface ModelImage {
  id: number;
  model_id: number;
  url: string;
  position: number;
  alt_text: string;
  created_at: string;
}

export interface AgeRange {
  min: number;
  max: number;
}

export interface Model {
  id: number;
  name: string;
  gender: 'male' | 'female';
  age_range?: AgeRange;
  date_of_birth?: string;
  status: 'active' | 'inactive';
  version: number;
  created_at: string;
  updated_at: string;
  images?: ModelImage[];
}

/**
 * Self-registered model with registration status
 */
export interface SelfRegisteredModel extends Model {
  user_id?: number;
  registration_status: RegistrationStatus;
  is_verified: boolean;
  rejection_reason?: string | null;

  // Date of birth (required for legal compliance)
  date_of_birth?: string;

  // Consent fields
  consent_age_confirmation?: boolean;
  consent_ai_usage?: boolean;
  consent_brand_usage?: boolean;
  consent_version?: string;
  consent_timestamp?: string;

  // Contact info
  phone_number?: string;
  country_code?: string;
  country?: string;
  instagram_handle?: string;

  // Physical attributes
  eye_color?: string;
  hair_color?: string;
  clothing_size?: ClothingSize;

  // Measurements (in cm)
  height_cm?: number;
  waist_cm?: number;
  hips_cm?: number;
  bust_cm?: number;
  chest_cm?: number;
  shoulder_width_cm?: number;
  inseam_cm?: number;
  neck_cm?: number;
  shoe_size_eu?: number;

  // Bio
  bio?: string;
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Zod validation schemas
export const modelRegistrationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  gender: z.enum(['male', 'female', 'non-binary', 'other']),

  // Date of birth (required, must be 18+)
  date_of_birth: z.string().min(1, 'Date of birth is required').refine(dob => {
    const age = calculateAge(dob);
    return age >= 18;
  }, 'Must be 18 years or older'),

  // Mandatory consent fields
  consent_age_confirmation: z.literal(true, {
    message: 'You must confirm you are 18 or older'
  }),
  consent_ai_usage: z.literal(true, {
    message: 'AI usage consent is required'
  }),
  consent_brand_usage: z.literal(true, {
    message: 'Brand usage consent is required'
  }),

  // Required country
  country: z.string().min(1, 'Country is required'),

  // Optional contact info
  phone_number: z.string().optional(),
  country_code: z.string().optional(),
  instagram_handle: z.string().optional(),

  // Optional physical attributes
  eye_color: z.string().optional(),
  hair_color: z.string().optional(),
  clothing_size: z.enum(['S', 'S-M', 'S-L', 'M-L', 'L-XL', 'L-XXL', 'XXL']).optional(),

  // Optional measurements
  height_cm: z.number().min(140).max(250).optional(),
  waist_cm: z.number().min(50).max(200).optional(),
  hips_cm: z.number().min(50).max(200).optional(),
  bust_cm: z.number().min(50).max(200).optional(),
  chest_cm: z.number().min(50).max(200).optional(),
  shoulder_width_cm: z.number().min(30).max(80).optional(),
  inseam_cm: z.number().min(50).max(120).optional(),
  neck_cm: z.number().min(20).max(60).optional(),
  shoe_size_eu: z.number().min(20).max(60).optional(),

  // Optional bio
  bio: z.string().max(1000, 'Bio too long').optional(),
});

export type ModelRegistrationData = z.infer<typeof modelRegistrationSchema>;

/**
 * Form data type that allows boolean consent fields for form state
 * (before validation, consent fields can be false)
 */
export type ModelFormData = Omit<ModelRegistrationData, 'consent_age_confirmation' | 'consent_ai_usage' | 'consent_brand_usage'> & {
  consent_age_confirmation?: boolean;
  consent_ai_usage?: boolean;
  consent_brand_usage?: boolean;
};

export const imageUploadSchema = z.object({
  image: z.string().startsWith('data:image/', 'Invalid image format'),
  position: z.number().min(1).max(10).optional(),
  alt_text: z.string().optional(),
});

export type ImageUploadData = z.infer<typeof imageUploadSchema>;

/**
 * API response structure for models endpoint
 */
export interface ModelsResponse {
  models: Model[];
}

/**
 * Props for model selector components
 */
export interface ModelSelectorProps {
  onModelSelect?: (modelId: string) => void;
  selectedModel?: string;
}

/**
 * Props for individual model card component
 */
export interface ModelCardProps {
  id: number | string;
  name: string;
  age: string;
  size: string;
  image: string;
  isSelected: boolean;
  onClick: () => void;
}

// ============================================================================
// Custom Model Types (Business-specific models)
// ============================================================================

/**
 * Custom model that belongs to a specific business/user
 * Only visible to that business - simple structure: just name and image
 */
export interface CustomModel {
  id: number;
  user_id: number;
  name: string;
  gender: 'male' | 'female';
  image_url: string;
  created_at: string;
  updated_at: string;
}

/**
 * Request payload for creating a custom model
 */
export interface CreateCustomModelRequest {
  name: string;
  gender: 'male' | 'female';
  image: string; // Base64 encoded image
}

/**
 * API response for custom models list
 */
export interface CustomModelsResponse {
  models: CustomModel[];
}

