# Flatlay Generation Payload Documentation

## Overview
This document explains the payload structure sent to the backend when the user clicks "Generate" in the flatlay generation flow.

## API Endpoint
```
POST /v1/flatlay/generate?flatlay
```

The `?flatlay` query parameter indicates that this request is coming from the flatlay generation feature. The presence of this parameter (without needing a value) serves as a boolean flag.

## Request Payload Structure

```typescript
{
  products: ProductImage[],
  modelId: string,
  backgroundId: string,
  options?: {
    quality?: 'low' | 'medium' | 'high',
    format?: 'png' | 'jpg' | 'webp',
    resolution?: {
      width: number,
      height: number
    }
  }
}
```

## Product Types & Image Structure

### Product Type Options
- **`top`** - Upper body garment (shirt, blouse, jacket, etc.)
- **`bottom`** - Lower body garment (pants, skirt, shorts, etc.)
- **`fullbody`** - Full body garment (dress, jumpsuit, etc.)

### Product Image Structure

Each product in the `products` array can contain:

```typescript
interface ProductImage {
  type: 'top' | 'bottom' | 'fullbody',
  frontImage?: string,  // Base64 encoded image
  backImage?: string    // Base64 encoded image
}
```

### Image Combinations by Type

#### 1. **TOP Product** (Must be paired with BOTTOM)
Required:
- `frontImage` - **REQUIRED** (front view of shirt/top)

Optional:
- `backImage` - Optional (back view of shirt/top)

```json
{
  "type": "top",
  "frontImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "backImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

#### 2. **BOTTOM Product** (Must be paired with TOP)
Required:
- `frontImage` - **REQUIRED** (front view of pants/skirt)

Optional:
- `backImage` - Optional (back view of pants/skirt)

```json
{
  "type": "bottom",
  "frontImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "backImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

#### 3. **FULLBODY Product** (Standalone - no pairing required)
Required:
- `frontImage` - **REQUIRED** (front view of dress/jumpsuit)

Optional:
- `backImage` - Optional (back view of dress/jumpsuit)

```json
{
  "type": "fullbody",
  "frontImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "backImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

## Complete Example Payloads

### Example 1: Top + Bottom (both with front images, bottom also has back)
```json
{
  "products": [
    {
      "type": "top",
      "frontImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    },
    {
      "type": "bottom",
      "frontImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "backImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    }
  ],
  "modelId": "model_123",
  "backgroundId": "bg_456",
  "options": {
    "quality": "high",
    "format": "png"
  }
}
```

### Example 2: Full Body Dress with Front & Back
```json
{
  "products": [
    {
      "type": "fullbody",
      "frontImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "backImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    }
  ],
  "modelId": "model_789",
  "backgroundId": "bg_012",
  "options": {
    "quality": "high",
    "format": "png"
  }
}
```

### Example 3: Top + Bottom (both with front and back images)
```json
{
  "products": [
    {
      "type": "top",
      "frontImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "backImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    },
    {
      "type": "bottom",
      "frontImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "backImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    }
  ],
  "modelId": "model_345",
  "backgroundId": "bg_678",
  "options": {
    "quality": "high",
    "format": "png"
  }
}
```

### Example 4: Full Body with Front Image Only
```json
{
  "products": [
    {
      "type": "fullbody",
      "frontImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    }
  ],
  "modelId": "model_999",
  "backgroundId": "bg_111",
  "options": {
    "quality": "high",
    "format": "png"
  }
}
```

## Important Notes

1. **Valid combinations only**: 
   - **Top + Bottom** - Both must be provided together (and each must have at least a front image)
   - **Full Body only** - Can be sent alone (must have at least a front image)
   - ❌ Top only or Bottom only are **NOT valid**

2. **Front image is REQUIRED**: All products (top, bottom, fullbody) must have a `frontImage`. This is mandatory.

3. **Back image is OPTIONAL**: The `backImage` can be omitted for any product type. It's extra data to show the back view.

4. **Base64 encoding**: All images are sent as Base64-encoded strings with the data URI prefix (e.g., `data:image/jpeg;base64,...`).

5. **Model & Background IDs**: Both must be provided as strings. The frontend automatically converts `backgroundId` to a string if it's stored as a number.

6. **Default options**: If not specified, the system defaults to:
   - Quality: `high`
   - Format: `png`

## Response Structure

```typescript
{
  success: boolean,
  jobId?: string,
  imageUrl?: string,
  message?: string,
  estimatedTime?: number,  // seconds
  status?: 'processing' | 'completed' | 'failed'
}
```

If a `jobId` is returned, the frontend will poll the `/v1/flatlay/status/:jobId` endpoint to check generation progress.

## Implementation Location

- **Service**: `src/services/flatLayService.ts` - `generateFlatlay()` method
- **Component**: `src/components/FlatLayPhotos.tsx` - `handleGenerateImage()` function
- **Types**: `src/types/flatlay.ts` - Type definitions
