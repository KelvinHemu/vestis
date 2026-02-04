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
  CatalogsResponse,
  PublicCatalogsResponse,
  CatalogGroup,
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
    if (filters?.catalog) params.append('catalog', filters.catalog);

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
   * List catalogs in user's shop (protected)
   */
  async listMyCatalogs(): Promise<CatalogsResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/shops/my-shop/catalogs`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to fetch catalogs');
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
    if (filters?.catalog) params.append('catalog', filters.catalog);

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
   * List catalogs in a public shop
   */
  async getPublicShopCatalogs(slug: string): Promise<PublicCatalogsResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/shop/${slug}/catalogs`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to fetch shop catalogs');
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

// ============================================
// Auto-Catalog Utility Functions
// ============================================

/**
 * Check if an item was created within the last N days
 */
export function isWithinDays(dateString: string, days: number): boolean {
  const itemDate = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - itemDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays <= days;
}

/**
 * Check if an item was created this week (within last 7 days)
 */
export function isThisWeek(dateString: string): boolean {
  return isWithinDays(dateString, 7);
}

/**
 * Check if an item is part of "New Collection" (within last 30 days)
 */
export function isNewCollection(dateString: string): boolean {
  return isWithinDays(dateString, 30);
}

/**
 * Group items into exclusive catalog groups based on creation date and user-defined catalogs.
 * Each item appears in only ONE group with the following priority:
 * 1. "This Week" (items from last 7 days without a user catalog)
 * 2. "New Collection" (items from last 30 days but NOT in this week, without a user catalog)
 * 3. User-defined catalogs
 * 4. Remaining items (older than 30 days without a catalog)
 */
export function groupItemsExclusive(items: ShopItem[]): {
  thisWeek: CatalogGroup | null;
  newCollection: CatalogGroup | null;
  userCatalogs: CatalogGroup[];
  remaining: ShopItem[];
} {
  const thisWeekItems: ShopItem[] = [];
  const newCollectionItems: ShopItem[] = [];
  const userCatalogMap = new Map<string, ShopItem[]>();
  const remainingItems: ShopItem[] = [];

  items.forEach(item => {
    // If item has a user-defined catalog, it goes there exclusively
    if (item.catalog) {
      const existing = userCatalogMap.get(item.catalog) || [];
      existing.push(item);
      userCatalogMap.set(item.catalog, existing);
    } else if (isThisWeek(item.created_at)) {
      // No user catalog + created this week
      thisWeekItems.push(item);
    } else if (isNewCollection(item.created_at)) {
      // No user catalog + created in last 30 days (but not this week)
      newCollectionItems.push(item);
    } else {
      // Older items without a catalog
      remainingItems.push(item);
    }
  });

  const userCatalogs = Array.from(userCatalogMap.entries()).map(([catalog, catalogItems]) => ({
    name: catalog,
    displayName: catalog,
    items: catalogItems,
    isAuto: false,
  }));

  return {
    thisWeek: thisWeekItems.length > 0 ? {
      name: 'this-week',
      displayName: 'New This Week',
      items: thisWeekItems,
      isAuto: true,
    } : null,
    newCollection: newCollectionItems.length > 0 ? {
      name: 'new-collection',
      displayName: 'New Collection',
      items: newCollectionItems,
      isAuto: true,
    } : null,
    userCatalogs,
    remaining: remainingItems,
  };
}

/**
 * Group items by their auto-catalogs based on creation date
 * @deprecated Use groupItemsExclusive instead to avoid duplicates
 */
export function groupItemsByAutoCatalog(items: ShopItem[]): CatalogGroup[] {
  const { thisWeek, newCollection } = groupItemsExclusive(items);
  const groups: CatalogGroup[] = [];
  
  if (newCollection) groups.push(newCollection);
  if (thisWeek) groups.push(thisWeek);
  
  return groups;
}

/**
 * Group items by their assigned catalog (from backend)
 * @deprecated Use groupItemsExclusive instead to avoid duplicates
 */
export function groupItemsByCatalog(items: ShopItem[]): CatalogGroup[] {
  const { userCatalogs } = groupItemsExclusive(items);
  return userCatalogs;
}

/**
 * Get all catalog groups (both auto-generated and user-defined)
 * Auto catalogs appear first, followed by user-defined catalogs
 */
export function getAllCatalogGroups(items: ShopItem[]): CatalogGroup[] {
  const { thisWeek, newCollection, userCatalogs } = groupItemsExclusive(items);
  const groups: CatalogGroup[] = [];
  
  if (newCollection) groups.push(newCollection);
  if (thisWeek) groups.push(thisWeek);
  groups.push(...userCatalogs);
  
  return groups;
}

/**
 * Get items that don't belong to any catalog
 */
export function getUncategorizedItems(items: ShopItem[]): ShopItem[] {
  return items.filter(item => !item.catalog);
}
