// Shop represents a digital shop owned by a user
export interface Shop {
  id: number;
  user_id: number;
  name: string;
  slug: string;
  tagline?: string;
  bio?: string;
  description?: string;
  logo_image?: string;
  banner_image?: string;
  theme_color: string;
  location?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  social_links?: Record<string, string>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ShopItem represents an item in a digital shop
export interface ShopItem {
  id: number;
  shop_id: number;
  generation_id?: number;
  name: string;
  description?: string;
  price: number;
  currency: string;
  category?: string;
  catalog?: string; // Collection/grouping name (e.g., "Summer Collection", "New Arrivals")
  images: string[];
  sizes?: string[];
  colors?: string[];
  is_available: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Request types
export interface CreateShopRequest {
  name: string;
  slug?: string;
  description?: string;
  theme_color?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  social_links?: Record<string, string>;
}

export interface UpdateShopRequest {
  name?: string;
  slug?: string;
  description?: string;
  logo_image?: string;
  banner_image?: string;
  theme_color?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  social_links?: Record<string, string>;
  is_active?: boolean;
}

export interface CreateShopItemRequest {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  category?: string;
  catalog?: string; // Collection/grouping name
  images: string[];
  sizes?: string[];
  colors?: string[];
  is_available?: boolean;
}

export interface CreateItemFromGenerationRequest {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  category?: string;
  catalog?: string; // Collection/grouping name
  sizes?: string[];
  colors?: string[];
}

export interface UpdateShopItemRequest {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  category?: string;
  catalog?: string | null; // Collection/grouping name (null to remove from catalog)
  images?: string[];
  sizes?: string[];
  colors?: string[];
  is_available?: boolean;
  display_order?: number;
}

// Response types
export interface ShopResponse {
  shop: Shop;
}

export interface ShopItemResponse {
  item: ShopItem;
}

export interface ShopItemsListResponse {
  items: ShopItem[];
  metadata: {
    current_page: number;
    page_size: number;
    total_records: number;
  };
}

export interface PublicShopItemsResponse {
  items: ShopItem[];
  metadata: {
    current_page: number;
    page_size: number;
    total_records: number;
  };
  shop: Shop;
}

export interface PublicShopItemResponse {
  item: ShopItem;
  shop: Shop;
}

export interface SlugCheckResponse {
  available: boolean;
  slug: string;
}

// Filter types
export interface ShopItemFilters {
  page?: number;
  page_size?: number;
  category?: string;
  catalog?: string; // Filter by catalog/collection
  available_only?: boolean;
}

// Catalog response types
export interface CatalogsResponse {
  catalogs: string[];
}

export interface PublicCatalogsResponse {
  catalogs: string[];
  shop: Shop;
}

// Auto-catalog types for date-based grouping
export type AutoCatalogType = 'new-collection' | 'this-week' | 'all';

export interface CatalogGroup {
  name: string;
  displayName: string;
  items: ShopItem[];
  isAuto?: boolean; // Whether this is an auto-generated catalog based on date
}
