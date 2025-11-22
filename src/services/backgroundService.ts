import type { Background, BackgroundsResponse, BackgroundCategory } from '../types/background';
import api from '../utils/apiClient';

/**
 * BackgroundService handles all background-related API calls
 */
class BackgroundService {
  /**
   * Fetch all backgrounds from the API
   * @returns Promise with backgrounds response containing count and backgrounds array
   */
  async getBackgrounds(): Promise<BackgroundsResponse> {
    try {
      const response = await api.get('/v1/backgrounds');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        throw new Error(errorData.message || 'Failed to fetch backgrounds');
      }

      const data: BackgroundsResponse = await response.json();
      console.log('Background service received data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching backgrounds:', error);
      throw error;
    }
  }

  /**
   * Fetch backgrounds by category
   * @param category - Filter backgrounds by category
   * @returns Promise with filtered backgrounds
   */
  async getBackgroundsByCategory(category: BackgroundCategory): Promise<Background[]> {
    try {
      const response = await this.getBackgrounds();
      return response.backgrounds.filter(bg => bg.category === category && bg.status === 'active');
    } catch (error) {
      console.error(`Error fetching ${category} backgrounds:`, error);
      throw error;
    }
  }

  /**
   * Fetch a single background by ID
   * @param id - The background ID
   * @returns Promise with the background data
   */
  async getBackgroundById(id: number): Promise<Background | undefined> {
    try {
      const response = await this.getBackgrounds();
      return response.backgrounds.find(bg => bg.id === id);
    } catch (error) {
      console.error(`Error fetching background with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all backgrounds sorted by category
   * @returns Array of backgrounds sorted by category
   */
  async getAllBackgroundsSorted(): Promise<Background[]> {
    try {
      const response = await this.getBackgrounds();
      return response.backgrounds
        .filter(bg => bg.status === 'active')
        .sort((a, b) => a.category.localeCompare(b.category));
    } catch (error) {
      console.error('Error fetching sorted backgrounds:', error);
      throw error;
    }
  }
}

// Export singleton instance
const backgroundService = new BackgroundService();
export default backgroundService;

// Keep legacy exports for backward compatibility
export const getBackgrounds = () => backgroundService.getBackgrounds();
export const getBackgroundsByCategory = (category: BackgroundCategory) => 
  backgroundService.getBackgroundsByCategory(category);
export const getBackgroundById = (id: number) => 
  backgroundService.getBackgroundById(id);

