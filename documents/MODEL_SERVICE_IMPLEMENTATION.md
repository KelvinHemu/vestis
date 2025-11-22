# Model Service Implementation

## Overview
This document outlines the implementation of the Model Service layer, which provides a clean separation of concerns for fetching and managing model data from the API.

## Architecture

### 1. Type Definitions (`src/types/model.ts`)
Defines all TypeScript interfaces and types for models:

- **`Model`**: Core model interface matching the API response structure
  - Contains all model properties: id, name, sex, age_range, size, active status, etc.
  - Image type fields for portrait and preview images

- **`ModelsResponse`**: API response structure
  - `count`: Total number of models
  - `models`: Array of Model objects

- **`ModelSelectorProps`**: Props for the ModelSelector component

- **`ModelCardProps`**: Props for individual ModelCard components

### 2. Service Layer (`src/services/modelService.ts`)
Singleton service class handling all model-related API calls:

#### Key Methods:

**`getModels()`**
- Fetches all models from the API endpoint: `api/v1/models`
- Includes authentication token if available
- Returns `ModelsResponse` with count and models array
- Handles errors gracefully with meaningful error messages

**`getModelsBySex(sex: 'male' | 'female')`**
- Filters models by gender
- Returns only active models
- Useful for category-specific filtering

**`getModelById(id: number)`**
- Fetches a single model by ID
- Returns null if model not found

**`getPortraitImageUrl(modelId: number)`**
- Generates the portrait image URL for a model
- Returns: `/api/v1/models/{modelId}/portrait`

**`getPreviewImageUrl(modelId: number, imageNumber: 1 | 2 | 3)`**
- Generates preview image URLs
- Returns: `/api/v1/models/{modelId}/preview{1|2|3}`

### 3. Component Updates (`src/components/ModelSelector.tsx`)

#### Removed:
- ❌ Hard-coded mock model data
- ❌ Static model arrays

#### Added:
- ✅ Real-time API data fetching with `useEffect`
- ✅ Loading state with spinner animation
- ✅ Error state with user-friendly error messages
- ✅ Dynamic image URLs using service methods
- ✅ Proper type safety with TypeScript interfaces
- ✅ Active model filtering (only shows active models)

#### State Management:
```typescript
const [models, setModels] = useState<Model[]>([]);
const [isLoading, setIsLoading] = useState<boolean>(true);
const [error, setError] = useState<string | null>(null);
```

## API Integration

### Endpoint
```
GET /api/v1/models
```

### Response Format
```json
{
  "count": 7,
  "models": [
    {
      "id": 8,
      "name": "Asha",
      "sex": "female",
      "age_range": "18-25",
      "size": "S-M",
      "active": true,
      "portrait_image_type": "image/jpeg",
      "preview_image1_type": "image/jpeg",
      "preview_image2_type": "image/jpeg",
      "preview_image3_type": "image/jpeg",
      "created_at": "2025-10-25T18:23:36.803857+03:00",
      "updated_at": "2025-10-25T18:23:36.803857+03:00"
    }
  ]
}
```

## Usage Example

```typescript
import modelService from '@/services/modelService';

// Fetch all models
const response = await modelService.getModels();
console.log(response.count); // 7
console.log(response.models); // Array of Model objects

// Get models by gender
const femaleModels = await modelService.getModelsBySex('female');

// Get model by ID
const model = await modelService.getModelById(8);

// Get image URLs
const portraitUrl = modelService.getPortraitImageUrl(8);
// Returns: "http://localhost:8080/api/v1/models/8/portrait"

const previewUrl = modelService.getPreviewImageUrl(8, 1);
// Returns: "http://localhost:8080/api/v1/models/8/preview1"
```

## Component Behavior

### Loading State
- Displays centered spinner with "Loading models..." message
- Shown during initial data fetch

### Error State
- Red alert box with error icon
- Shows error message from API or generic "Failed to load models"
- Provides clear visual feedback to user

### Empty State
- Shows when no models match the selected category
- Includes icon, message, and helpful suggestion
- User-friendly feedback

### Success State
- Grid layout (1 column mobile, 2 tablet, 3 desktop)
- Model cards with portrait images
- Clickable selection with visual feedback
- Gender filter buttons (Female/Male)
- Clear button to deselect

## Best Practices Followed

1. **Separation of Concerns**
   - Types in dedicated types file
   - API logic in service layer
   - UI logic in component
   - No mixing of concerns

2. **Type Safety**
   - Full TypeScript coverage
   - Strict type checking
   - Interface-based contracts

3. **Error Handling**
   - Try-catch blocks in service
   - User-friendly error messages
   - Console logging for debugging
   - Graceful degradation

4. **Code Organization**
   - Clear file structure
   - Descriptive function names
   - Comprehensive comments
   - Logical code sections

5. **User Experience**
   - Loading indicators
   - Error feedback
   - Empty states
   - Smooth transitions

## Configuration

The API base URL is configured via environment variable:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
```

Set in your `.env` file:
```
VITE_API_URL=http://your-api-url.com/api
```

## Testing

To test the implementation:

1. Ensure the backend API is running
2. Set the correct `VITE_API_URL` in your environment
3. Load the ModelSelector component
4. Verify:
   - Models load from API
   - Loading state appears briefly
   - Models display correctly
   - Gender filtering works
   - Selection functionality works
   - Images load from API endpoints

## Future Enhancements

Potential improvements:
- Caching layer for model data
- Pagination support for large model lists
- Search/filter functionality
- Model detail view
- Image lazy loading
- Optimistic UI updates
- Retry logic for failed requests

