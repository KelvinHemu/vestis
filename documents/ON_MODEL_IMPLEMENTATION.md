# On-Model Photos Feature Implementation

## Overview
Successfully implemented the On-Model Photos feature, similar to the FlatLay feature but with a different workflow focused on uploading photos of models wearing clothes and transforming them with different models and backgrounds.

## Key Differences from FlatLay
- **No Product Selector**: Users upload photos of products already on models instead of selecting product types
- **Multiple Photo Upload**: Users can upload multiple photos (up to 10) of models wearing their products
- **API Endpoint**: Uses `/v1/generate?onmodel` instead of `/v1/generate?flatlay`

## Implementation Details

### 1. Type Definitions (`src/types/onModel.ts`)
Created comprehensive TypeScript types for:
- `ModelPhoto`: Individual photo data structure
- `GenerateOnModelRequest`: Request payload for generation
- `GenerateOnModelResponse`: API response (camelCase)
- `OnModelJobStatus`: Job status tracking
- `OnModelHistory`: History and metadata
- `OnModelHistoryResponse`: History list response

### 2. Service Layer (`src/services/onModelPhotosService.ts`)
Implemented `OnModelPhotosService` as a singleton with the following methods:
- `generateOnModel()`: Initiates on-model photo generation with `/v1/generate?onmodel`
- `getJobStatus()`: Checks job status
- `pollJobStatus()`: Polls until completion with configurable intervals
- `getHistory()`: Fetches generation history
- `getOnModelById()`: Gets specific generation details
- `deleteOnModel()`: Deletes from history

Features:
- Automatic backgroundId string conversion
- Comprehensive logging for debugging
- Error handling and response mapping (snake_case → camelCase)

### 3. Components

#### `OnModelUpload.tsx`
- Upload multiple model photos (up to 10)
- Visual preview of uploaded photos
- Remove individual photos
- Clear all photos
- Dynamic "Add More" button

#### `OnModelPreviewPanel.tsx`
- Shows uploaded photos preview (grid of 4 with count)
- Displays selected model ID
- Displays selected background ID
- Clean, organized preview layout

#### `OnModelPhotos.tsx` (Main Component)
Complete workflow implementation with:
- **Step 1**: Upload Photos - Multiple photo upload interface
- **Step 2**: Select Models - Model selector integration
- **Step 3**: Select Background - Background selector integration
- **Step 4**: Preview & Generate - Generation and result display

Features:
- Step-by-step navigation with progress tracking
- Validation before proceeding to next step
- Generation progress indicator with custom loader
- Error handling with retry option
- Success display with download button
- "Generate Again" functionality

### 4. Custom Hook (`src/hooks/useOnModelGeneration.ts`)
`useOnModelGeneration` hook manages:
- Generation state (loading, error, result)
- API integration with service layer
- Job status polling
- Reset functionality

## API Integration

### Request Format
```typescript
POST /v1/generate?onmodel
{
  photos: [
    { id: "0", image: "base64..." },
    { id: "1", image: "base64..." }
  ],
  modelId: "model-123",
  backgroundId: "5",  // Converted to string
  options: {
    quality: "high",
    format: "png"
  }
}
```

### Response Format
```typescript
{
  success: true,
  job_id: "job-abc-123",
  image_url: "https://...",
  message: "Generation started",
  estimated_time: 30,
  status: "processing",
  model_id: 123,
  background_id: 5,
  photo_count: 2,
  generated_at: "2025-11-17T..."
}
```

## Files Created/Modified

### Created
1. `src/types/onModel.ts` - Type definitions
2. `src/services/onModelPhotosService.ts` - Service layer
3. `src/components/OnModelUpload.tsx` - Photo upload component
4. `src/components/OnModelPreviewPanel.tsx` - Preview panel
5. `src/hooks/useOnModelGeneration.ts` - Custom hook

### Modified
1. `src/components/OnModelPhotos.tsx` - Complete feature implementation
2. `src/components/index.ts` - Added new component exports

## User Flow
1. User navigates to "On-Model Photos" section
2. Uploads one or more photos of products on models
3. Selects desired model from ModelSelector
4. Selects desired background from BackgroundSelector
5. Reviews selections in preview panel
6. Clicks "Generate On-Model Photos"
7. Waits for generation (with progress indicator)
8. Views result and can download or generate again

## Testing Recommendations
1. Test with single photo upload
2. Test with multiple photos (2-10)
3. Test photo removal functionality
4. Test step navigation and validation
5. Test generation with different models and backgrounds
6. Test error scenarios (network failure, API errors)
7. Test retry functionality
8. Verify API endpoint receives correct payload format
9. Test job polling and status updates
10. Test download functionality

## Notes
- All components follow the existing design system
- Error handling is consistent with FlatLay implementation
- Logging is comprehensive for debugging
- Type safety is maintained throughout
- Service uses singleton pattern for consistency
- Background ID is automatically converted to string for backend compatibility
