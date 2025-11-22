import { api } from '../utils/apiClient';
import type { Generation, GenerationListResponse } from '../types/generation';

export const generationService = {
  // List generations with pagination
  list: async (page = 1, pageSize = 20): Promise<GenerationListResponse> => {
    const response = await api.get(`/v1/generations?page=${page}&page_size=${pageSize}`);

    if (!response.ok) {
      throw new Error('Failed to fetch generations');
    }

    return response.json();
  },

  // Get single generation
  get: async (id: number): Promise<{ generation: Generation }> => {
    const response = await api.get(`/v1/generations/${id}`);

    if (!response.ok) {
      throw new Error('Generation not found');
    }

    return response.json();
  },

  // Delete generation
  delete: async (id: number): Promise<void> => {
    const response = await api.delete(`/v1/generations/${id}`);

    if (!response.ok) {
      throw new Error('Failed to delete generation');
    }
  }
};
