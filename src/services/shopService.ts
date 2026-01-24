import { API_BASE_URL, STORAGE_KEYS } from '@/config/api';
import type {
  Shop,
  ShopItem,
  ShopResponse,
  ShopItemResponse,
  ShopItemsListResponse,
  PublicShopItemsResponse,
  PublicShopItemResponse,
  SlugCheckResponse,
  CreateShopRequest,
  UpdateShopRequest,
  CreateShopItemRequest,
  CreateItemFromGenerationRequest,
  UpdateShopItemRequest,
  ShopItemFilters,
} from '@/types/shop';

class ShopService {
  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.authToken) : null;
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // ============================================
  // Shop Management (Protected)
  // ============================================

  /**
   * Create a new shop for the authenticated user
   */
  async createShop(data: CreateShopRequest): Promise<Shop> {
    const response = await fetch(`${API_BASE_URL}/v1/shops`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to create shop');
    }

    const result: ShopResponse = await response.json();
    return result.shop;
  }

  /**
   * Get the current user's shop
   */
  async getMyShop(): Promise<Shop | null> {
    const response = await fetch(`${API_BASE_URL}/v1/shops/my-shop`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (response.status === 404) {
      return null; // User doesn't have a shop yet
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to fetch shop');
    }

    const result: ShopResponse = await response.json();
    return result.shop;
  }

  /**
   * Update the current user's shop
   */
  async updateMyShop(data: UpdateShopRequest): Promise<Shop> {
    const response = await fetch(`${API_BASE_URL}/v1/shops/my-shop`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to update shop');
    }

    const result: ShopResponse = await response.json();
    return result.shop;
  }

  /**
   * Delete the current user's shop
   */
  async deleteMyShop(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/v1/shops/my-shop`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to delete shop');
    }
  }

  /**
   * Upload shop logo
   */
  async uploadShopLogo(file: File): Promise<Shop> {
    const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.authToken) : null;
    const formData = new FormData();
    formData.append('logo', file);

    const response = await fetch(`${API_BASE_URL}/v1/shops/my-shop/logo`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to upload logo');
    }

    const result: ShopResponse = await response.json();
    return result.shop;
  }

  /**
   * Upload shop banner
   */
  async uploadShopBanner(file: File): Promise<Shop> {
    const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.authToken) : null;
    const formData = new FormData();
    formData.append('banner', file);

    const response = await fetch(`${API_BASE_URL}/v1/shops/my-shop/banner`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to upload banner');
    }

    const result: ShopResponse = await response.json();
    return result.shop;
  }

  /**
   * Check if a slug is available
   */
  async checkSlugAvailability(slug: string): Promise<SlugCheckResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/shops/check-slug?slug=${encodeURIComponent(slug)}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to check slug');
    }

    return response.json();
  }

  // ============================================
  // Shop Items Management (Protected)
  // ============================================

  /**
   * List items in user's shop
   */
  async listMyShopItems(filters?: ShopItemFilters): Promise<ShopItemsListResponse> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.page_size) params.append('page_size', filters.page_size.toString());
    if (filters?.category) params.append('category', filters.category);

    const response = await fetch(`${API_BASE_URL}/v1/shops/my-shop/items?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to fetch items');
    }

    return response.json();
  }

  /**
   * Create a new shop item
   */
  async createShopItem(data: CreateShopItemRequest): Promise<ShopItem> {
    const response = await fetch(`${API_BASE_URL}/v1/shops/my-shop/items`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to create item');
    }

    const result: ShopItemResponse = await response.json();
    return result.item;
  }

  /**
   * Create a shop item from an existing generation
   */
  async createItemFromGeneration(generationId: number, data: CreateItemFromGenerationRequest): Promise<ShopItem> {
    const response = await fetch(`${API_BASE_URL}/v1/shops/my-shop/items/from-generation/${generationId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to create item from generation');
    }

    const result: ShopItemResponse = await response.json();
    return result.item;
  }

  /**
   * Get a specific shop item
   */
  async getMyShopItem(itemId: number): Promise<ShopItem> {
    const response = await fetch(`${API_BASE_URL}/v1/shops/my-shop/items/${itemId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to fetch item');
    }

    const result: ShopItemResponse = await response.json();
    return result.item;
  }

  /**
   * Update a shop item
   */
  async updateShopItem(itemId: number, data: UpdateShopItemRequest): Promise<ShopItem> {
    const response = await fetch(`${API_BASE_URL}/v1/shops/my-shop/items/${itemId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to update item');
    }

    const result: ShopItemResponse = await response.json();
    return result.item;
  }

  /**
   * Delete a shop item
   */
  async deleteShopItem(itemId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/v1/shops/my-shop/items/${itemId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to delete item');
    }
  }

  /**
   * Upload images for a shop item
   */
  async uploadShopItemImages(itemId: number, files: File[]): Promise<ShopItem> {
    const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.authToken) : null;
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await fetch(`${API_BASE_URL}/v1/shops/my-shop/items/${itemId}/images`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to upload images');
    }

    const result: ShopItemResponse = await response.json();
    return result.item;
  }

  // ============================================
  // Public Shop Routes (No Auth Required)
  // ============================================

  /**
   * Get a public shop by slug
   */
  async getPublicShop(slug: string): Promise<Shop> {
    const response = await fetch(`${API_BASE_URL}/v1/shop/${slug}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Shop not found');
    }

    const result: ShopResponse = await response.json();
    return result.shop;
  }

  /**
   * List items in a public shop
   */
  async getPublicShopItems(slug: string, filters?: ShopItemFilters): Promise<PublicShopItemsResponse> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.page_size) params.append('page_size', filters.page_size.toString());
    if (filters?.category) params.append('category', filters.category);

    const response = await fetch(`${API_BASE_URL}/v1/shop/${slug}/items?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to fetch shop items');
    }

    return response.json();
  }

  /**
   * Get a specific item in a public shop
   */
  async getPublicShopItem(slug: string, itemId: number): Promise<PublicShopItemResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/shop/${slug}/items/${itemId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Item not found');
    }

    return response.json();
  }

  // ============================================
  // Utility Functions
  // ============================================

  /**
   * Generate WhatsApp inquiry link for an item
   */
  generateWhatsAppLink(shop: Shop, item: ShopItem, baseUrl: string): string {
    if (!shop.whatsapp) return '';

    const message = encodeURIComponent(
      `Hi! I'm interested in "${item.name}" (${item.currency} ${item.price.toFixed(2)}) from your shop "${shop.name}".\n\nLink: ${baseUrl}/shop/${shop.slug}/item/${item.id}`
    );

    // Remove any non-numeric characters from phone number
    const phone = shop.whatsapp.replace(/\D/g, '');
    return `https://wa.me/${phone}?text=${message}`;
  }

  /**
   * Generate email inquiry link for an item
   */
  generateEmailLink(shop: Shop, item: ShopItem, baseUrl: string): string {
    if (!shop.email) return '';

    const subject = encodeURIComponent(`Inquiry: ${item.name} - ${shop.name}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'm interested in "${item.name}" (${item.currency} ${item.price.toFixed(2)}) from your shop.\n\nLink: ${baseUrl}/shop/${shop.slug}/item/${item.id}\n\nPlease let me know more details.\n\nThank you!`
    );

    return `mailto:${shop.email}?subject=${subject}&body=${body}`;
  }

  /**
   * Generate shareable shop link
   */
  getShopLink(slug: string, baseUrl: string): string {
    return `${baseUrl}/shop/${slug}`;
  }

  /**
   * Generate shareable item link
   */
  getItemLink(slug: string, itemId: number, baseUrl: string): string {
    return `${baseUrl}/shop/${slug}/item/${itemId}`;
  }
}

export const shopService = new ShopService();
export default shopService;

// ============================================
// Standalone Utility Functions
// ============================================

/**
 * Format price with currency
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Generate WhatsApp link with pre-filled message
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Generate mailto link with subject and body
 */
export function generateEmailLink(email: string, subject: string, body: string): string {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  return `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
}
