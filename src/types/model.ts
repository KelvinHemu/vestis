/**
 * Model data types
 * These types represent the model data structure from the API
 */

import { z } from 'zod';

export type RegistrationStatus = 'pending' | 'approved' | 'rejected';
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
  age_range: AgeRange;
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

// Zod validation schemas
export const modelRegistrationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  gender: z.enum(['male', 'female', 'non-binary', 'other']),
  age_min: z.number().min(18, 'Minimum age is 18').max(120, 'Invalid age'),
  age_max: z.number().min(18, 'Minimum age is 18').max(120, 'Invalid age'),

  // Optional contact info
  phone_number: z.string().optional(),
  country_code: z.string().optional(),
  country: z.string().optional(),
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
}).refine(data => data.age_max >= data.age_min, {
  message: 'Maximum age must be greater than or equal to minimum age',
  path: ['age_max'],
});

export type ModelRegistrationData = z.infer<typeof modelRegistrationSchema>;

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

