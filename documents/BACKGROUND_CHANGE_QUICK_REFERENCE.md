# Background Change Feature - Quick Reference

## Quick Start

### Access the Feature
Navigate to: `/background-change`

### Basic Usage Flow
1. Upload product photos (1-10 images)
2. Select a background
3. Generate and download

## Key Files

### Components
- `src/components/backgrounChange.tsx` - Main component
- `src/components/BackgroundChangeUpload.tsx` - Photo upload
- `src/components/BackgroundChangePreviewPanel.tsx` - Preview panel

### Services
- `src/services/backgroundChangeService.ts` - API service
- `src/services/backgroundService.ts` - Background data

### Hooks & Types
- `src/hooks/useBackgroundChange.ts` - Generation hook
- `src/types/backgroundChange.ts` - TypeScript types

## API Quick Reference

### Generate Background Change
```typescript
POST /v1/generate?background
{
  photos: [{ id: "0", image: "data:image/..." }],
  backgroundId: "123"
}
```

### Check Job Status
```typescript
GET /v1/background-change/status/:jobId
```

### Get History
```typescript
GET /v1/background-change/history?limit=20&offset=0
```

## Common Tasks

### Add to Navigation
```tsx
// In your navigation component
<Link to="/background-change">Background Change</Link>
```

### Use the Service Directly
```typescript
import { backgroundChangeService } from '@/services/backgroundChangeService';

await backgroundChangeService.generateBackgroundChange({
  photos: [...],
  backgroundId: "123"
});
```

### Use the Hook
```typescript
import { useBackgroundChange } from '@/hooks/useBackgroundChange';

const {
  isGenerating,
  generatedImageUrl,
  generateBackgroundChange,
  resetGeneration
} = useBackgroundChange();
```

## Troubleshooting

### Images not loading
- Check image format (must be data URI)
- Verify file size limits
- Check console for errors

### Generation fails
- Verify API endpoint is correct
- Check authentication token
- Review request payload format

### Preview not updating
- Check state updates in React DevTools
- Verify props are passed correctly
- Check for console errors

## Configuration

### Polling Settings
Edit in `backgroundChangeService.ts`:
```typescript
pollInterval: 2000,  // 2 seconds
maxAttempts: 60      // 2 minutes total
```

### Upload Limits
Edit in `BackgroundChangeUpload.tsx`:
```typescript
photoCount: 10  // Maximum photos
```

## Comparison with On-Model Feature

| Feature | Background Change | On-Model |
|---------|------------------|-----------|
| Steps | 3 | 4 |
| Model Selection | ❌ | ✅ |
| Background Selection | ✅ | ✅ |
| Photo Upload | ✅ | ✅ |
| Use Case | Product backgrounds | Model photography |

## Export Structure

### components/index.ts
```typescript
export { BackgroundChange } from './backgrounChange';
export { BackgroundChangeUpload } from './BackgroundChangeUpload';
export { BackgroundChangePreviewPanel } from './BackgroundChangePreviewPanel';
```

## State Structure

```typescript
{
  currentStep: 0,           // 0: Upload, 1: Background, 2: Generate
  maxUnlockedStep: 0,       // Navigation control
  photos: {                 // Indexed object
    0: "data:image/...",
    1: "data:image/..."
  },
  selectedBackgroundId: 123,
  selectedBackground: {     // Full background object
    id: 123,
    name: "Studio White",
    category: "studio",
    url: "https://..."
  }
}
```

## Error Codes

Common API error scenarios:
- `400` - Invalid request (check payload)
- `401` - Unauthorized (check auth token)
- `404` - Resource not found
- `500` - Server error (retry)
- `503` - Service unavailable (wait and retry)

## Performance Tips

1. **Optimize images before upload** - Resize if too large
2. **Limit concurrent requests** - One generation at a time
3. **Cache background data** - Reuse fetched backgrounds
4. **Clean up on unmount** - Cancel pending requests

## Security Considerations

- ✅ Authentication required
- ✅ File type validation
- ✅ Data URI sanitization
- ✅ API token in headers
- ⚠️ Consider file size limits
- ⚠️ Validate image dimensions

## Related Documentation

- [Full Feature Documentation](./BACKGROUND_CHANGE_FEATURE.md)
- [API Integration Guide](./API_INTEGRATION.md)
- [Authentication Guide](./AUTHENTICATION.md)
