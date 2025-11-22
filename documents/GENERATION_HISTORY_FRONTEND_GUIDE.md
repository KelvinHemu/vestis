# Generation History - Frontend Integration Guide

## Overview

The backend now stores all image generation results in a database. Users can view, retrieve, and delete their generation history through new API endpoints.

## Authentication

All endpoints require a valid JWT token in the `Authorization` header:

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

## API Endpoints

### 1. List User's Generations

**Endpoint:** `GET /api/v1/generations`

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `page_size` (optional, default: 20, max: 100) - Items per page

**Example Request:**
```javascript
const response = await fetch('http://localhost:4000/api/v1/generations?page=1&page_size=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
```

**Response (200 OK):**
```json
{
  "generations": [
    {
      "id": 123,
      "user_id": 1,
      "feature_type": "onmodel",
      "image_url": "https://res.cloudinary.com/...",
      "model_id": 1,
      "background_id": 2,
      "photo_count": 1,
      "created_at": "2024-11-20T23:25:14Z"
    },
    {
      "id": 122,
      "feature_type": "chat",
      "image_url": "https://res.cloudinary.com/...",
      "prompt": "A dress on a model in Paris",
      "created_at": "2024-11-20T22:15:30Z"
    }
  ],
  "metadata": {
    "current_page": 1,
    "page_size": 20,
    "total_records": 45
  }
}
```

### 2. Get Single Generation

**Endpoint:** `GET /api/v1/generations/{id}`

**Example Request:**
```javascript
const response = await fetch(`http://localhost:4000/api/v1/generations/${generationId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
```

**Response (200 OK):**
```json
{
  "generation": {
    "id": 123,
    "user_id": 1,
    "feature_type": "flatlay",
    "image_url": "https://res.cloudinary.com/...",
    "model_id": 1,
    "background_id": 21,
    "product_count": 2,
    "created_at": "2024-11-20T23:25:14Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "the requested resource could not be found"
}
```

### 3. Delete Generation

**Endpoint:** `DELETE /api/v1/generations/{id}`

**Example Request:**
```javascript
const response = await fetch(`http://localhost:4000/api/v1/generations/${generationId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
```

**Response (200 OK):**
```json
{
  "message": "generation successfully deleted"
}
```

## Generation Object Fields

| Field | Type | Description | Always Present |
|-------|------|-------------|----------------|
| `id` | number | Unique generation ID | ✅ |
| `user_id` | number | ID of the user who created it | ✅ |
| `feature_type` | string | Type of generation (see below) | ✅ |
| `image_url` | string | Cloudinary URL of generated image | ✅ |
| `created_at` | string (ISO 8601) | When the image was generated | ✅ |
| `model_id` | number | Model used (if applicable) | ❌ |
| `background_id` | number | Background used (if applicable) | ❌ |
| `prompt` | string | User prompt (for chat/background change) | ❌ |
| `photo_count` | number | Number of photos used | ❌ |
| `product_count` | number | Number of products used | ❌ |

## Feature Types

The `feature_type` field indicates which generation endpoint was used:

| Feature Type | Description | Related Fields |
|-------------|-------------|----------------|
| `legacy` | Single product generation | `model_id`, `background_id` |
| `flatlay` | Multiple product flatlay | `model_id`, `background_id`, `product_count` |
| `mannequin` | Mannequin with products | `model_id`, `background_id`, `product_count` |
| `onmodel` | On-model with photos | `model_id`, `background_id`, `photo_count` |
| `chat` | Free-form chat generation | `prompt` |
| `background_change` | Background replacement | `background_id`, `prompt`, `photo_count` |

## React/TypeScript Example

```typescript
// types.ts
interface Generation {
  id: number;
  user_id: number;
  feature_type: 'legacy' | 'flatlay' | 'mannequin' | 'onmodel' | 'chat' | 'background_change';
  image_url: string;
  created_at: string;
  model_id?: number;
  background_id?: number;
  prompt?: string;
  photo_count?: number;
  product_count?: number;
}

interface GenerationListResponse {
  generations: Generation[];
  metadata: {
    current_page: number;
    page_size: number;
    total_records: number;
  };
}

// api.ts
export const generationAPI = {
  // List generations with pagination
  list: async (page = 1, pageSize = 20): Promise<GenerationListResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/generations?page=${page}&page_size=${pageSize}`,
      {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch generations');
    }
    
    return response.json();
  },

  // Get single generation
  get: async (id: number): Promise<{ generation: Generation }> => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/generations/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Generation not found');
    }
    
    return response.json();
  },

  // Delete generation
  delete: async (id: number): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/generations/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to delete generation');
    }
  }
};

// Component Example
const GenerationHistory: React.FC = () => {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGenerations();
  }, [page]);

  const loadGenerations = async () => {
    setLoading(true);
    try {
      const data = await generationAPI.list(page, 20);
      setGenerations(data.generations);
      setTotalPages(Math.ceil(data.metadata.total_records / data.metadata.page_size));
    } catch (error) {
      console.error('Failed to load generations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this generation?')) return;
    
    try {
      await generationAPI.delete(id);
      loadGenerations(); // Reload list
    } catch (error) {
      console.error('Failed to delete generation:', error);
    }
  };

  return (
    <div>
      <h2>Generation History</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="grid">
            {generations.map((gen) => (
              <div key={gen.id} className="generation-card">
                <img src={gen.image_url} alt={`Generation ${gen.id}`} />
                <div className="info">
                  <span className="feature-type">{gen.feature_type}</span>
                  <span className="date">{new Date(gen.created_at).toLocaleDateString()}</span>
                </div>
                <button onClick={() => handleDelete(gen.id)}>Delete</button>
              </div>
            ))}
          </div>
          
          <div className="pagination">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};
```

## Error Handling

| Status Code | Meaning | Action |
|------------|---------|--------|
| 200 | Success | Process response data |
| 401 | Unauthorized | Redirect to login |
| 404 | Not Found | Show "Generation not found" message |
| 422 | Validation Error | Show validation errors to user |
| 500 | Server Error | Show generic error message |

## Implementation Checklist

- [ ] Create TypeScript interfaces for Generation and responses
- [ ] Implement API service functions (list, get, delete)
- [ ] Build generation history page with pagination
- [ ] Add delete confirmation dialog
- [ ] Display feature-specific information based on `feature_type`
- [ ] Handle loading and error states
- [ ] Add search/filter functionality (future enhancement)
- [ ] Implement image preview/zoom functionality
- [ ] Add ability to re-use generation parameters

## Notes

- All newly generated images are automatically saved to the database
- Users can only access their own generations (enforced by backend)
- Generations are ordered by creation date (newest first)
- When a user is deleted, all their generations are automatically removed
- Maximum page size is 100 items

## Support

For questions or issues, contact the backend team or check the main implementation doc at `GENERATION_HISTORY_IMPLEMENTATION.md`.

