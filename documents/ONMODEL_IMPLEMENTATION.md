# On-Model Feature Implementation

## Overview
The on-model feature provides a simplified API format for generating fashion photos with clothing placed on human models. This feature accepts a simple array of product photos (without type classification) and transfers them onto the selected model in the chosen background.

## API Endpoint

### Request Format
```
POST /api/v1/generate?onmodel
```

### Request Body
```json
{
  "photos": [
    {
      "id": "0",
      "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA..."
    },
    {
      "id": "1",
      "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
    }
  ],
  "modelId": "123",
  "backgroundId": "456",
  "options": {
    "quality": "high",
    "format": "png"
  }
}
```

### Response Format
```json
{
  "success": true,
  "message": "on-model image generation completed",
  "model_id": 123,
  "background_id": 456,
  "photo_count": 2,
  "generated_at": "2025-11-17T10:30:00Z",
  "image_url": "https://res.cloudinary.com/xxx/image/upload/onmodel_123_456_1700217000",
  "status": "completed",
  "feature": "onmodel"
}
```

## Key Features

### 1. Simplified Photo Format
- **No Type Classification**: Unlike the flatlay/mannequin endpoints, on-model doesn't require specifying if items are "top", "bottom", or "fullbody"
- **ID-Based**: Each photo has a simple ID field for tracking
- **Single Image Per Photo**: Only one image per photo (no front/back distinction)
- **Flexible Quantity**: Accepts 1 or more photos

### 2. String-Based IDs
- `modelId` and `backgroundId` are accepted as strings
- Internally converted to int64 for database queries
- Provides better compatibility with frontend implementations

### 3. AI-Powered Clothing Transfer
The system uses a sophisticated AI prompt that:
- **Preserves Model Identity**: Keeps the exact same model's face, body, skin tone, and features
- **Transfers Clothing**: Only changes the clothing on the model
- **Professional Output**: Generates photorealistic fashion photography
- **Natural Poses**: Creates confident, natural modeling poses

## Implementation Details

### Handler Function
`createOnModelImageHandler` in `cmd/api/generate.go`

**Process Flow**:
1. Parse and validate request body
2. Validate photo data and IDs
3. Parse modelId and backgroundId from strings to int64
4. Fetch model image from database (position 1)
5. Fetch background image from database
6. Download model and background images from URLs
7. Decode base64 photo images
8. Build AI prompt using `buildOnModelPrompt`
9. Prepare image inputs (photos, model, background)
10. Generate image using AI model
11. Upload result to Cloudinary with prefix `onmodel_`
12. Return response with image URL

### Helper Functions

#### `processPhotoImages(photos []Photo) ([]image.Input, error)`
- Decodes base64 photo images
- Extracts MIME types from data URIs
- Validates image data
- Returns prepared image inputs for generation

#### `buildOnModelPrompt(photoCount int) string`
- Constructs AI prompt based on number of photos
- Emphasizes model preservation requirements
- Adapts instructions for single vs multiple photos
- Ensures professional fashion photography output

### Data Structures

```go
type Photo struct {
    ID    string `json:"id"`    // Unique identifier
    Image string `json:"image"` // Base64 encoded image
}
```

## Routing Logic

The `generateImageHandler` function routes requests based on query parameters:

```go
if r.URL.Query().Has("flatlay") {
    app.createFlatlayImageHandler(w, r)
} else if r.URL.Query().Has("mdoli") {
    app.createMannequinImageHandler(w, r)
} else if r.URL.Query().Has("onmodel") {
    app.createOnModelImageHandler(w, r)  // New handler
} else {
    app.createImageHandler(w, r)  // Legacy
}
```

## Validation Rules

### Required Fields
- `photos` array must have at least 1 photo
- Each photo must have `image` field (base64 data)
- `modelId` must be a valid positive integer (provided as string)
- `backgroundId` must be a valid positive integer (provided as string)

### Optional Fields
- `id` field in photos (for tracking)
- `options` object (quality, format, resolution)

### Image Validation
- Base64 images must be valid and decodable
- Supports data URI format: `data:image/<type>;base64,<data>`
- Supports plain base64 (defaults to image/png)
- Supported formats: JPEG, PNG, WebP

## Error Handling

### Common Errors
- `400 Bad Request`: Invalid request format, missing required fields
- `404 Not Found`: Model or background ID not found in database
- `500 Internal Server Error`: Image fetch failures, generation failures, upload failures

### Error Response Format
```json
{
  "error": "Error description message"
}
```

## Logging

Successful generations are logged with the following fields:
- `model_id`: Database ID of the model used
- `background_id`: Database ID of the background used
- `photo_count`: Number of photos processed
- `generated_at`: Timestamp of generation
- `image_size_bytes`: Size of generated image
- `cloudinary_image_url`: Final uploaded image URL
- `feature`: Set to "onmodel" for tracking

## Comparison with Other Generation Methods

| Feature | On-Model | Flatlay | Mannequin | Legacy |
|---------|----------|---------|-----------|---------|
| Query Param | `?onmodel` | `?flatlay` | `?mdoli` | (none) |
| Photo Format | Simple photos array | Products with types | Products with types | Single product |
| Front/Back | Not supported | Supported | Supported | Not supported |
| Type Classification | Not required | Required | Required | Not required |
| Use Case | Simple photo transfer | Flat product layouts | Mannequin photos | Single item try-on |
| ID Format | String | String | String | Integer |

## Frontend Integration

### Expected Frontend Behavior
1. User uploads 1+ product photos
2. User selects a model from available models
3. User selects a background from available backgrounds
4. Frontend sends POST request to `/api/v1/generate?onmodel`
5. Frontend receives image URL in response
6. Frontend displays generated image to user

### Authentication
All requests require JWT authentication via `Authorization: Bearer <token>` header.

## Testing

### Sample cURL Request
```bash
curl -X POST 'http://localhost:4000/api/v1/generate?onmodel' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "photos": [
      {
        "id": "0",
        "image": "data:image/jpeg;base64,/9j/4AAQ..."
      }
    ],
    "modelId": "1",
    "backgroundId": "1"
  }'
```

### Test Cases
1. **Single Photo**: Upload one product photo
2. **Multiple Photos**: Upload 2-4 product photos
3. **Different Formats**: Test JPEG, PNG, WebP
4. **Invalid IDs**: Test with non-existent model/background IDs
5. **Invalid Base64**: Test with malformed base64 data
6. **Missing Fields**: Test without required fields

## Performance Considerations

- **Image Size**: Base64 encoding increases size by ~33%
- **Request Limits**: Large photos (1-5MB each) require appropriate request size limits
- **Generation Time**: AI generation typically takes 20-45 seconds
- **Cloudinary Upload**: Additional 1-3 seconds for upload

## Future Enhancements

### Potential Improvements
1. **Asynchronous Processing**: Implement job queue for long-running generations
2. **Progress Updates**: WebSocket or polling for generation status
3. **Batch Processing**: Generate multiple variations in one request
4. **Style Options**: Allow users to specify photography style preferences
5. **Resolution Control**: Custom output resolutions
6. **Caching**: Cache generated images for identical requests

## Related Files

- **Handler**: `cmd/api/generate.go` - `createOnModelImageHandler`
- **Routes**: `cmd/api/routes.go` - Endpoint registration
- **Documentation**: `documents/ON_MODEL_REQUEST_FORMAT.md` - API specification
- **Image Generation**: `internal/image/generation.go` - AI generation logic
- **Cloudinary Upload**: `internal/cloudinary/upload.go` - Image upload

## Notes

1. The on-model feature is designed to be simpler than flatlay/mannequin endpoints
2. No product type classification is required
3. The AI automatically determines how to combine multiple clothing items
4. Model preservation is critical - the same model must appear in output
5. All generated images are uploaded to Cloudinary with `onmodel_` prefix
6. Feature tracking via `feature: "onmodel"` in logs and responses


