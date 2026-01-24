import type { CustomBackground, CustomBackgroundsResponse, CreateCustomBackgroundInput } from '../types/customBackground';
import api from '../utils/apiClient';

/**
 * CustomBackgroundService handles all custom background-related API calls
 */
class CustomBackgroundService {
    /**
     * Fetch all custom backgrounds for the authenticated user
     */
    async getCustomBackgrounds(): Promise<CustomBackgroundsResponse> {
        try {
            const response = await api.get('/v1/custom-backgrounds');

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error:', response.status, errorData);
                throw new Error(errorData.message || 'Failed to fetch custom backgrounds');
            }

            const data: CustomBackgroundsResponse = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching custom backgrounds:', error);
            throw error;
        }
    }

    /**
     * Create a new custom background
     */
    async createCustomBackground(input: CreateCustomBackgroundInput): Promise<CustomBackground> {
        try {
            const response = await api.post('/v1/custom-backgrounds', input);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error:', response.status, errorData);
                throw new Error(errorData.message || errorData.error || 'Failed to create custom background');
            }

            const data = await response.json();
            return data.custom_background;
        } catch (error) {
            console.error('Error creating custom background:', error);
            throw error;
        }
    }

    /**
     * Get a specific custom background by ID
     */
    async getCustomBackgroundById(id: number): Promise<CustomBackground> {
        try {
            const response = await api.get(`/v1/custom-backgrounds/${id}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch custom background');
            }

            const data = await response.json();
            return data.custom_background;
        } catch (error) {
            console.error(`Error fetching custom background ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete a custom background
     */
    async deleteCustomBackground(id: number): Promise<void> {
        try {
            const response = await api.delete(`/v1/custom-backgrounds/${id}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to delete custom background');
            }
        } catch (error) {
            console.error(`Error deleting custom background ${id}:`, error);
            throw error;
        }
    }
}

// Export singleton instance
const customBackgroundService = new CustomBackgroundService();
export default customBackgroundService;

// Named exports for convenience
export const getCustomBackgrounds = () => customBackgroundService.getCustomBackgrounds();
export const createCustomBackground = (input: CreateCustomBackgroundInput) =>
    customBackgroundService.createCustomBackground(input);
export const getCustomBackgroundById = (id: number) =>
    customBackgroundService.getCustomBackgroundById(id);
export const deleteCustomBackground = (id: number) =>
    customBackgroundService.deleteCustomBackground(id);
