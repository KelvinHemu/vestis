# Shop Catalog Feature - Frontend Integration Guide

## 📋 Overview

The catalog feature allows shop owners to organize their items into collections/groups. Think of catalogs as "collections" or "sections" in a shop:

- **"Summer Collection 2026"** - All summer items
- **"New Arrivals"** - Latest products
- **"Sale Items"** - Discounted products
- **"Nike Products"** - Brand-specific grouping

This guide shows you how to integrate this feature into the frontend.

---

## 🆕 What's New?

### API Changes

1. **New Field Added to Items:**
   ```typescript
   interface ShopItem {
     // ... existing fields
     catalog?: string;  // NEW! e.g., "Summer Collection"
   }
   ```

2. **New Endpoints:**
   - `GET /api/v1/shops/my-shop/catalogs` - List user's catalogs (protected)
   - `GET /api/v1/shop/{slug}/catalogs` - List public shop catalogs (public)

3. **Enhanced Filtering:**
   - All item listing endpoints now accept `catalog` query parameter

---

## 🔌 API Reference

### 1. List All Catalogs (Protected)

**Endpoint:** `GET /api/v1/shops/my-shop/catalogs`

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "catalogs": [
    "Summer Collection",
    "Winter Wear",
    "New Arrivals"
  ]
}
```

**Example (Fetch):**
```typescript
const fetchMyCatalogs = async (token: string): Promise<string[]> => {
  const response = await fetch('/api/v1/shops/my-shop/catalogs', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch catalogs');
  }
  
  const data = await response.json();
  return data.catalogs;
};

// Usage
const catalogs = await fetchMyCatalogs(authToken);
console.log(catalogs); // ["Summer Collection", "Winter Wear", ...]
```

**Example (Axios):**
```typescript
const fetchMyCatalogs = async (): Promise<string[]> => {
  const { data } = await axios.get('/api/v1/shops/my-shop/catalogs', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return data.catalogs;
};
```

---

### 2. List All Catalogs (Public)

**Endpoint:** `GET /api/v1/shop/{slug}/catalogs`

**Authentication:** Not required

**Response:**
```json
{
  "catalogs": [
    "Summer Collection",
    "New Arrivals"
  ],
  "shop": {
    "id": 1,
    "name": "My Fashion Store",
    "slug": "my-fashion-store",
    // ... other shop fields
  }
}
```

**Example:**
```typescript
const fetchPublicCatalogs = async (shopSlug: string) => {
  const response = await fetch(`/api/v1/shop/${shopSlug}/catalogs`);
  const data = await response.json();
  
  return {
    catalogs: data.catalogs,
    shop: data.shop
  };
};

// Usage
const { catalogs, shop } = await fetchPublicCatalogs('my-fashion-store');
```

---

### 3. Filter Items by Catalog (Protected)

**Endpoint:** `GET /api/v1/shops/my-shop/items?catalog={catalogName}`

**Example:**
```typescript
const fetchItemsByCatalog = async (
  catalog: string,
  token: string,
  page: number = 1
) => {
  const params = new URLSearchParams({
    catalog: catalog,
    page: page.toString(),
    page_size: '20'
  });
  
  const response = await fetch(
    `/api/v1/shops/my-shop/items?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return response.json();
};

// Usage
const summerItems = await fetchItemsByCatalog('Summer Collection', token);
```

---

### 4. Filter Items by Catalog (Public)

**Endpoint:** `GET /api/v1/shop/{slug}/items?catalog={catalogName}`

**Example:**
```typescript
const fetchPublicItemsByCatalog = async (
  shopSlug: string,
  catalog: string,
  page: number = 1
) => {
  const params = new URLSearchParams({
    catalog: catalog,
    page: page.toString()
  });
  
  const response = await fetch(
    `/api/v1/shop/${shopSlug}/items?${params}`
  );
  
  return response.json();
};

// Usage
const data = await fetchPublicItemsByCatalog(
  'my-fashion-store',
  'Summer Collection'
);
```

---

### 5. Create Item with Catalog

**Endpoint:** `POST /api/v1/shops/my-shop/items`

**Request Body:**
```json
{
  "name": "Red Summer Dress",
  "catalog": "Summer Collection",
  "price": 49.99,
  "currency": "USD",
  "description": "Beautiful red dress perfect for summer",
  "category": "Dresses",
  "images": ["https://..."],
  "sizes": ["S", "M", "L"],
  "colors": ["Red"],
  "is_available": true
}
```

**Example:**
```typescript
interface CreateItemData {
  name: string;
  catalog?: string;  // Optional
  price: number;
  currency: string;
  description?: string;
  category?: string;
  images: string[];
  sizes?: string[];
  colors?: string[];
  is_available?: boolean;
}

const createItem = async (
  itemData: CreateItemData,
  token: string
) => {
  const response = await fetch('/api/v1/shops/my-shop/items', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(itemData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to create item');
  }
  
  return response.json();
};

// Usage
const newItem = await createItem({
  name: 'Red Summer Dress',
  catalog: 'Summer Collection',
  price: 49.99,
  currency: 'USD',
  images: ['https://example.com/image.jpg']
}, authToken);
```

---

### 6. Update Item Catalog

**Endpoint:** `PUT /api/v1/shops/my-shop/items/{id}`

**Request Body (Partial Update):**
```json
{
  "catalog": "New Arrivals"
}
```

**Example:**
```typescript
const updateItemCatalog = async (
  itemId: number,
  catalog: string,
  token: string
) => {
  const response = await fetch(
    `/api/v1/shops/my-shop/items/${itemId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ catalog })
    }
  );
  
  return response.json();
};

// Usage - Move item to different catalog
await updateItemCatalog(123, 'Winter Wear', token);

// Usage - Remove item from catalog
await updateItemCatalog(123, null, token);
```

---

## 🎨 UI Implementation Examples

### Example 1: Display Catalogs as Tabs

```typescript
import { useState, useEffect } from 'react';

interface ShopItem {
  id: number;
  name: string;
  catalog?: string;
  price: number;
  images: string[];
  // ... other fields
}

const ShopItemsWithCatalogs = ({ shopSlug }: { shopSlug: string }) => {
  const [catalogs, setCatalogs] = useState<string[]>([]);
  const [selectedCatalog, setSelectedCatalog] = useState<string>('all');
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch catalogs on mount
  useEffect(() => {
    const loadCatalogs = async () => {
      const response = await fetch(`/api/v1/shop/${shopSlug}/catalogs`);
      const data = await response.json();
      setCatalogs(data.catalogs);
    };
    loadCatalogs();
  }, [shopSlug]);

  // Fetch items when catalog changes
  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      const url = selectedCatalog === 'all'
        ? `/api/v1/shop/${shopSlug}/items`
        : `/api/v1/shop/${shopSlug}/items?catalog=${encodeURIComponent(selectedCatalog)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setItems(data.items);
      setLoading(false);
    };
    loadItems();
  }, [shopSlug, selectedCatalog]);

  return (
    <div>
      {/* Catalog Tabs */}
      <div className="catalog-tabs">
        <button
          onClick={() => setSelectedCatalog('all')}
          className={selectedCatalog === 'all' ? 'active' : ''}
        >
          All Items
        </button>
        {catalogs.map((catalog) => (
          <button
            key={catalog}
            onClick={() => setSelectedCatalog(catalog)}
            className={selectedCatalog === catalog ? 'active' : ''}
          >
            {catalog}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="items-grid">
        {loading ? (
          <p>Loading...</p>
        ) : (
          items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))
        )}
      </div>
    </div>
  );
};
```

---

### Example 2: Display Items Grouped by Catalog

```typescript
const ShopItemsGrouped = ({ shopSlug }: { shopSlug: string }) => {
  const [catalogGroups, setCatalogGroups] = useState<
    Record<string, ShopItem[]>
  >({});

  useEffect(() => {
    const loadGroupedItems = async () => {
      // 1. Fetch all catalogs
      const catalogsResponse = await fetch(
        `/api/v1/shop/${shopSlug}/catalogs`
      );
      const { catalogs } = await catalogsResponse.json();

      // 2. Fetch items for each catalog
      const groups: Record<string, ShopItem[]> = {};
      
      for (const catalog of catalogs) {
        const itemsResponse = await fetch(
          `/api/v1/shop/${shopSlug}/items?catalog=${encodeURIComponent(catalog)}`
        );
        const { items } = await itemsResponse.json();
        groups[catalog] = items;
      }

      // 3. Fetch uncategorized items (optional)
      const allItemsResponse = await fetch(
        `/api/v1/shop/${shopSlug}/items`
      );
      const { items: allItems } = await allItemsResponse.json();
      
      const uncategorized = allItems.filter(
        (item: ShopItem) => !item.catalog
      );
      
      if (uncategorized.length > 0) {
        groups['Uncategorized'] = uncategorized;
      }

      setCatalogGroups(groups);
    };

    loadGroupedItems();
  }, [shopSlug]);

  return (
    <div className="catalog-sections">
      {Object.entries(catalogGroups).map(([catalog, items]) => (
        <section key={catalog} className="catalog-section">
          <h2>{catalog}</h2>
          <div className="items-grid">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
```

---

### Example 3: Catalog Dropdown Filter

```typescript
const CatalogFilter = ({ 
  shopSlug, 
  onFilterChange 
}: { 
  shopSlug: string;
  onFilterChange: (catalog: string | null) => void;
}) => {
  const [catalogs, setCatalogs] = useState<string[]>([]);

  useEffect(() => {
    const loadCatalogs = async () => {
      const response = await fetch(`/api/v1/shop/${shopSlug}/catalogs`);
      const data = await response.json();
      setCatalogs(data.catalogs);
    };
    loadCatalogs();
  }, [shopSlug]);

  return (
    <select 
      onChange={(e) => onFilterChange(e.target.value || null)}
      className="catalog-filter"
    >
      <option value="">All Collections</option>
      {catalogs.map((catalog) => (
        <option key={catalog} value={catalog}>
          {catalog}
        </option>
      ))}
    </select>
  );
};
```

---

### Example 4: Create Item Form with Catalog

```typescript
const CreateItemForm = ({ token }: { token: string }) => {
  const [catalogs, setCatalogs] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    catalog: '',
    price: 0,
    currency: 'USD',
    images: [],
    // ... other fields
  });

  useEffect(() => {
    // Load existing catalogs
    const loadCatalogs = async () => {
      const response = await fetch('/api/v1/shops/my-shop/catalogs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCatalogs(data.catalogs);
    };
    loadCatalogs();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const response = await fetch('/api/v1/shops/my-shop/items', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      alert('Item created successfully!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Item name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />

      {/* Catalog Selection */}
      <div>
        <label>Collection/Catalog:</label>
        <select
          value={formData.catalog}
          onChange={(e) => setFormData({...formData, catalog: e.target.value})}
        >
          <option value="">No catalog</option>
          {catalogs.map((catalog) => (
            <option key={catalog} value={catalog}>
              {catalog}
            </option>
          ))}
        </select>
        
        {/* Or allow creating new catalog */}
        <input
          type="text"
          placeholder="Or create new catalog..."
          value={formData.catalog}
          onChange={(e) => setFormData({...formData, catalog: e.target.value})}
        />
      </div>

      <input
        type="number"
        placeholder="Price"
        value={formData.price}
        onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
        required
      />

      {/* ... other form fields ... */}

      <button type="submit">Create Item</button>
    </form>
  );
};
```

---

## 📱 TypeScript Types

```typescript
// Complete ShopItem interface
interface ShopItem {
  id: number;
  shop_id: number;
  generation_id?: number;
  name: string;
  description?: string;
  price: number;
  currency: string;
  category?: string;
  catalog?: string;  // NEW!
  images: string[];
  sizes?: string[];
  colors?: string[];
  is_available: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// API Response types
interface CatalogsResponse {
  catalogs: string[];
}

interface PublicCatalogsResponse {
  catalogs: string[];
  shop: Shop;
}

interface ItemsResponse {
  items: ShopItem[];
  metadata: {
    current_page: number;
    page_size: number;
    total_records: number;
  };
}

interface PublicItemsResponse extends ItemsResponse {
  shop: Shop;
}

// Shop interface
interface Shop {
  id: number;
  user_id: number;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  theme_color: string;
  contact_email?: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  social_links: Record<string, string>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

---

## 🎯 Common Use Cases

### Use Case 1: Seasonal Collections
```typescript
// Shop owner creates seasonal catalogs
const seasonalCatalogs = [
  "Spring 2026",
  "Summer 2026",
  "Fall 2026",
  "Winter 2026"
];

// Each item gets assigned to appropriate season
await createItem({
  name: "Floral Dress",
  catalog: "Spring 2026",
  // ...
});
```

### Use Case 2: Brand Collections
```typescript
// Multi-brand store
const brands = ["Nike", "Adidas", "Puma", "Reebok"];

// Filter items by brand
const nikeItems = await fetchPublicItemsByCatalog(
  shopSlug,
  "Nike"
);
```

### Use Case 3: Product Categories
```typescript
// Organize by product type
const catalogs = [
  "Men's Clothing",
  "Women's Clothing",
  "Accessories",
  "Shoes"
];
```

### Use Case 4: Sale/Promotion Collections
```typescript
// Time-limited collections
await createItem({
  name: "Discounted Shirt",
  catalog: "Black Friday Sale 2026",
  price: 19.99,
  // ...
});
```

---

## ⚠️ Important Notes

### 1. Catalog is Optional
Items can exist without a catalog. Don't force users to select one.

```typescript
// This is valid - no catalog
const item = {
  name: "Basic T-Shirt",
  catalog: null, // or undefined, or empty string
  price: 15.99
};
```

### 2. Catalog Names are Case-Sensitive
"Summer Collection" ≠ "summer collection"

```typescript
// Be consistent with catalog names
const catalog = "Summer Collection"; // ✅
// Not: "summer collection", "SUMMER COLLECTION", etc.
```

### 3. Maximum Length
Catalog names are limited to 100 characters.

```typescript
// Validation example
const validateCatalog = (catalog: string): boolean => {
  return catalog.length <= 100;
};
```

### 4. Filtering Returns Exact Matches
The API filters by exact catalog name match.

```typescript
// This will NOT work
const items = await fetchItems('Summer'); // Won't match "Summer Collection"

// This WILL work
const items = await fetchItems('Summer Collection'); // Exact match
```

### 5. Empty Catalogs
If a shop has no catalogs, the API returns an empty array.

```typescript
const { catalogs } = await fetchCatalogs(shopSlug);
// catalogs = [] if no items have catalogs
```

---

## 🐛 Error Handling

```typescript
const fetchCatalogsWithErrorHandling = async (
  shopSlug: string
): Promise<string[]> => {
  try {
    const response = await fetch(`/api/v1/shop/${shopSlug}/catalogs`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Shop not found');
      }
      throw new Error('Failed to fetch catalogs');
    }
    
    const data = await response.json();
    return data.catalogs || [];
    
  } catch (error) {
    console.error('Error fetching catalogs:', error);
    return []; // Return empty array as fallback
  }
};
```

---

## ✅ Testing Checklist

- [ ] Can fetch catalogs from API
- [ ] Can filter items by catalog
- [ ] Can create item with catalog
- [ ] Can create item without catalog
- [ ] Can update item catalog
- [ ] Can remove item from catalog (set to null)
- [ ] Handles empty catalog list gracefully
- [ ] Handles shop not found error
- [ ] Handles authentication errors
- [ ] UI updates when catalog filter changes
- [ ] Catalog names display correctly (with spaces, special chars)

---

## 📞 Need Help?

**Common Issues:**

1. **"Catalogs not showing"**
   - Ensure items actually have catalog field set
   - Check API response in Network tab

2. **"Filter not working"**
   - Verify catalog name matches exactly (case-sensitive)
   - Check URL encoding for spaces: `encodeURIComponent(catalog)`

3. **"Can't create catalog"**
   - Catalogs are created automatically when you assign them to items
   - No separate "create catalog" endpoint needed

---

## 🚀 Quick Start

1. **Fetch and display catalogs:**
```typescript
const catalogs = await fetch('/api/v1/shop/my-shop-slug/catalogs')
  .then(r => r.json())
  .then(d => d.catalogs);

console.log(catalogs); // ["Summer", "Winter", ...]
```

2. **Filter items:**
```typescript
const items = await fetch('/api/v1/shop/my-shop-slug/items?catalog=Summer')
  .then(r => r.json())
  .then(d => d.items);
```

3. **Create item with catalog:**
```typescript
await fetch('/api/v1/shops/my-shop/items', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'New Item',
    catalog: 'Summer Collection',
    price: 29.99,
    currency: 'USD',
    images: ['https://...']
  })
});
```

---

**Last Updated:** February 3, 2026  
**API Version:** v1
