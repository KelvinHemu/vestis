# Background Change Feature Implementation

## Overview
The Background Change feature allows users to change the background of product photos without needing model selection. It's a streamlined version of the On-Model feature focused purely on background replacement.

## Architecture

### Components

#### 1. `BackgroundChange.tsx`
Main component that orchestrates the entire background change workflow.
- **Location**: `src/components/backgrounChange.tsx`
- **Features**:
  - 3-step wizard interface (Upload → Select Background → Preview & Generate)
  - State management for photos and background selection
  - Integration with background change generation API
  - Real-time preview and download functionality
  - Error handling with retry capability

#### 2. `BackgroundChangeUpload.tsx`
Component for uploading product photos.
- **Location**: `src/components/BackgroundChangeUpload.tsx`
- **Features**:
  - Support for up to 10 photos
  - Drag-and-drop file upload
  - Individual photo removal
  - Clear all functionality
  - Preview of uploaded images

#### 3. `BackgroundChangePreviewPanel.tsx`
Side panel component showing selections and preview.
- **Location**: `src/components/BackgroundChangePreviewPanel.tsx`
- **Features**:
  - Displays uploaded photos (first 4 with count indicator)
  - Shows selected background with details
  - Clean, organized layout

### Services

#### `backgroundChangeService.ts`
Singleton service handling all background change API interactions.
- **Location**: `src/services/backgroundChangeService.ts`
- **Methods**:
  - `generateBackgroundChange()` - Initiates background change generation
  - `getJobStatus()` - Checks status of a generation job
  - `pollJobStatus()` - Polls job status until completion
  - `getHistory()` - Retrieves generation history
  - `getBackgroundChangeById()` - Gets specific generation details
  - `deleteBackgroundChange()` - Deletes a generation from history

#### Enhanced `backgroundService.ts`
Refactored to class-based singleton pattern.
- **Location**: `src/services/backgroundService.ts`
- **New Methods**:
  - `getAllBackgroundsSorted()` - Gets all active backgrounds sorted by category
- **Maintains backward compatibility** with legacy function exports

### Hooks

#### `useBackgroundChange.ts`
Custom React hook for managing background change generation state.
- **Location**: `src/hooks/useBackgroundChange.ts`
- **Returns**:
  - `isGenerating` - Loading state
  - `generationError` - Error message if any
  - `generatedImageUrl` - URL of generated image
  - `jobStatus` - Current job status
  - `generateBackgroundChange()` - Function to trigger generation
  - `resetGeneration()` - Function to reset state

### Types

#### `backgroundChange.ts`
TypeScript type definitions for background change feature.
- **Location**: `src/types/backgroundChange.ts`
- **Interfaces**:
  - `BackgroundChangePhoto` - Individual photo structure
  - `GenerateBackgroundChangeRequest` - API request payload
  - `GenerateBackgroundChangeResponse` - API response (camelCase)
  - `GenerateBackgroundChangeResponseRaw` - Raw API response (snake_case)
  - `BackgroundChangeJobStatus` - Job status tracking
  - `BackgroundChangeHistory` - Historical generation data
  - `BackgroundChangeHistoryResponse` - History list response

## User Flow

```
1. Upload Photos
   ↓
2. Select Background
   ↓
3. Preview & Generate
   ↓
4. Download/Regenerate
```

### Step 1: Upload Photos
- Users can upload 1-10 product photos
- Images are converted to base64 data URIs
- Preview shown immediately after upload
- Individual or bulk removal supported

### Step 2: Select Background
- Browse backgrounds by category (Indoor/Outdoor/Studio)
- Visual selection with preview
- Selected background highlighted with checkmark
- Can clear and reselect

### Step 3: Preview & Generate
- Review all selections in side panel
- Click "Generate Image" to start processing
- Shows loading animation during generation
- Displays generated image upon completion
- Download or regenerate options available

## API Integration

### Endpoint
```
POST /v1/generate?background
```

### Request Format
```typescript
{
  photos: [
    {
      id: "0",
      image: "data:image/jpeg;base64,..."
    }
  ],
  backgroundId: "123"
}
```

### Response Format
```typescript
{
  success: true,
  job_id?: "uuid",
  image_url?: "https://...",
  message?: "string",
  estimated_time?: 30,
  status?: "processing" | "completed" | "failed",
  background_id?: 123,
  photo_count?: 1,
  generated_at?: "2024-01-01T00:00:00Z"
}
```

## Routing

### Route Configuration
- **Path**: `/background-change`
- **Protected**: Yes (requires authentication)
- **Layout**: AppLayout (with Sidebar)

Added to `App.tsx`:
```tsx
<Route 
  path="/background-change" 
  element={
    <ProtectedRoute>
      <AppLayout>
        <BackgroundChange />
      </AppLayout>
    </ProtectedRoute>
  } 
/>
```

## Key Features

### 1. Streamlined Workflow
- Only 3 steps (vs 4 in On-Model)
- No model selection required
- Focus on product and background only

### 2. Error Handling
- Comprehensive validation before API calls
- User-friendly error messages
- Retry functionality on failure
- Network error handling

### 3. Job Status Polling
- Automatic polling for async generation
- Progress updates via callback
- Configurable poll interval and max attempts
- Timeout handling

### 4. Image Management
- Base64 encoding for uploads
- Data URI validation
- Efficient memory management
- Download functionality for results

### 5. Responsive UI
- Clean, modern interface
- Step-based navigation
- Real-time preview updates
- Loading states and animations

## File Structure

```
src/
├── components/
│   ├── backgrounChange.tsx              # Main component
│   ├── BackgroundChangeUpload.tsx       # Upload interface
│   ├── BackgroundChangePreviewPanel.tsx # Preview panel
│   └── index.ts                         # Updated exports
├── services/
│   ├── backgroundChangeService.ts       # New service
│   └── backgroundService.ts             # Enhanced service
├── hooks/
│   └── useBackgroundChange.ts          # Custom hook
├── types/
│   └── backgroundChange.ts             # Type definitions
└── App.tsx                             # Added route
```

## Usage Example

```tsx
import { BackgroundChange } from './components';

// Component is used within protected route
<Route path="/background-change" element={
  <ProtectedRoute>
    <AppLayout>
      <BackgroundChange />
    </AppLayout>
  </ProtectedRoute>
} />
```

## State Management

The component uses React's `useState` and `useEffect` hooks for:
- Current step tracking
- Max unlocked step (navigation control)
- Photo storage (indexed object)
- Background selection
- Generation state (via custom hook)

## Validation

### Client-Side Validation
- Photos must be provided
- Background must be selected
- Images must be valid base64 data URIs
- File type validation (images only)

### API Validation
- Request structure validation
- Required field checks
- Data type validation
- Error response handling

## Performance Considerations

1. **Image Optimization**: Images converted to data URIs for upload
2. **Lazy Loading**: Background images loaded on demand
3. **Polling Optimization**: Configurable intervals to balance responsiveness and server load
4. **Memory Management**: Cleanup on component unmount

## Future Enhancements

Potential improvements for future versions:
1. Batch processing of multiple photos
2. Custom background upload
3. Real-time preview before generation
4. History/gallery view of past generations
5. Image editing capabilities (crop, resize, etc.)
6. Advanced background customization options
7. Export to different formats/sizes

## Testing Recommendations

1. **Unit Tests**: Service methods, hooks, utilities
2. **Integration Tests**: API interactions, state management
3. **E2E Tests**: Complete user workflows
4. **Performance Tests**: Large image handling, concurrent generations
5. **Error Scenarios**: Network failures, invalid inputs, timeout handling

## Dependencies

- React 18+
- TypeScript 4.9+
- React Router v6
- Lucide React (icons)
- Tailwind CSS (styling)

## API Compatibility

The feature is designed to work with backend endpoints following this pattern:
- Generation: `POST /v1/generate?background`
- Status: `GET /v1/background-change/status/:jobId`
- History: `GET /v1/background-change/history`
- Detail: `GET /v1/background-change/:id`
- Delete: `DELETE /v1/background-change/:id`

## Maintenance Notes

- Keep API request/response type mappings in sync with backend
- Monitor polling intervals for optimal UX
- Regular security audits for file upload handling
- Performance monitoring for large image processing
