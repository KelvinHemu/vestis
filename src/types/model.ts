/**
 * Model data types
 * These types represent the model data structure from the API
 */

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
  images: ModelImage[];
}

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

