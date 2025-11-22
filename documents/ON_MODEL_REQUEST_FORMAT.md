# On-Model Photo Generation - API Request Format

## Endpoint
```
POST /v1/generate?onmodel
```

## Request Headers
- `Content-Type: application/json`
- `Authorization: Bearer <access_token>`

## Request Body Structure

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

## Field Specifications

### `photos` (required)
- **Type**: Array of objects
- **Description**: Product photos to be placed on model
- Each photo object contains:
  - `id` (string): Unique identifier for the photo (e.g., "0", "1", "2")
  - `image` (string): Base64-encoded image data with data URI scheme
    - Format: `data:image/<type>;base64,<base64_string>`
    - Supported types: `jpeg`, `jpg`, `png`, `webp`
- **Minimum**: 1 photo
- **Maximum**: No hard limit (frontend typically sends 1-4 photos)

### `modelId` (required)
- **Type**: String
- **Description**: ID of the selected model/mannequin
- **Example**: `"123"`, `"model_abc"`

### `backgroundId` (required)
- **Type**: String
- **Description**: ID of the selected background
- **Example**: `"456"`, `"bg_studio_white"`
- **Note**: Frontend converts numeric IDs to strings before sending

### `options` (optional)
- **Type**: Object
- **Fields**:
  - `quality` (string): Generation quality level
    - Values: `"low"`, `"medium"`, `"high"`
    - Default: `"high"`
  - `format` (string): Output image format
    - Values: `"png"`, `"jpeg"`, `"webp"`
    - Default: `"png"`

## Expected Response

### Success Response (200 OK - Synchronous)
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

**Response Fields:**
- `success` (boolean): Whether the operation was successful
- `message` (string): Human-readable status message
- `model_id` (number): The model ID used for generation
- `background_id` (number): The background ID used for generation
- `photo_count` (number): Number of photos processed
- `generated_at` (string): ISO 8601 timestamp of generation
- `image_url` (string): Direct URL to the generated image
- `status` (string): Generation status - `"completed"`, `"processing"`, or `"failed"`
- `feature` (string): Feature identifier - always `"onmodel"`

### Alternative Response (202 Accepted - Asynchronous)
If processing takes longer, the API may return:
```json
{
  "success": true,
  "job_id": "job_abc123",
  "message": "On-model generation started",
  "estimated_time": 30,
  "status": "processing",
  "model_id": 123,
  "background_id": 456,
  "photo_count": 2,
  "generated_at": "2025-11-17T10:30:00Z"
}
```

Client should then poll: `GET /v1/onmodel/status/{job_id}`

### Error Response (4xx/5xx)
```json
{
  "success": false,
  "message": "Error description",
  "error_code": "INVALID_REQUEST"
}
```

## Important Notes

1. **Image Size**: Base64-encoded images can be large (1-5MB per photo). Consider request size limits.

2. **Authentication**: All requests require valid JWT access token in Authorization header.

3. **Query Parameter**: The `?onmodel` query parameter is used to identify on-model generation requests (vs flat-lay generation).

4. **Data Types**: 
   - **Request**: `modelId` and `backgroundId` are sent as **strings**
   - **Response**: Backend returns `model_id` and `background_id` as **numbers**
   - Frontend automatically converts response numbers to strings for consistency
   - Photo `id` fields are strings (e.g., "0", "1", not 0, 1)

5. **Processing**: 
   - Generation can be synchronous (immediate `image_url` in response) or asynchronous (returns `job_id`)
   - For async processing, client polls job status using the returned `job_id`
   - Status endpoint: `GET /v1/onmodel/status/{job_id}`

## Example cURL Request

```bash
curl -X POST 'https://api.example.com/v1/generate?onmodel' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
  -d '{
    "photos": [
      {
        "id": "0",
        "image": "data:image/jpeg;base64,/9j/4AAQ..."
      }
    ],
    "modelId": "123",
    "backgroundId": "456",
    "options": {
      "quality": "high",
      "format": "png"
    }
  }'
```

## Validation Requirements

- At least 1 photo must be provided
- `modelId` must reference an existing model
- `backgroundId` must reference an existing background
- Base64 images must have valid data URI format
- Image data must be valid and decodable

---

**Frontend Implementation**: `src/services/onModelPhotosService.ts`  
**Request Hook**: `src/hooks/useOnModelGeneration.ts`
