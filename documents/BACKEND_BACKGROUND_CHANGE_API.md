   # Background Change API Endpoint Specification

## Endpoint
```
POST /v1/generate?background
```

## Description
This endpoint generates product photos with changed backgrounds. It receives product photos and a background ID, then returns the processed images with the new background applied.

## Authentication
**Required**: Yes
- Include JWT token in `Authorization` header
- Format: `Bearer <token>`

## Request

### Headers
```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### Request Body
```json
{
  "photos": [
    {
      "id": "0",
      "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    },
    {
      "id": "1",
      "image": "data:image/png;base64,iVBORw0KGgoAAAANS..."
    }
  ],
  "backgroundId": "123"
}
```

### Field Specifications

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `photos` | Array | Yes | Array of photo objects to process |
| `photos[].id` | String | Yes | Unique identifier for tracking each photo |
| `photos[].image` | String | Yes | Base64-encoded image with data URI prefix |
| `backgroundId` | String | Yes | ID of the background to apply |

### Validation Rules

1. **photos array**
   - Must contain at least 1 photo
   - Maximum 10 photos per request
   - Each photo must have both `id` and `image` fields

2. **image format**
   - Must be a valid base64 data URI
   - Must start with `data:image/`
   - Supported formats: JPEG, PNG, WebP
   - Recommended max size: 10MB per image

3. **backgroundId**
   - Must be a valid string
   - Must correspond to an existing background in the database
   - Background must have `status = 'active'`

## Response

### Success Response (Synchronous)
**Status Code**: `200 OK`

```json
{
  "success": true,
  "image_url": "https://storage.example.com/generated/uuid-123.jpg",
  "message": "Background change completed successfully",
  "status": "completed",
  "background_id": 123,
  "photo_count": 2,
  "generated_at": "2025-11-19T10:30:00Z"
}
```

### Success Response (Asynchronous)
**Status Code**: `202 Accepted`

```json
{
  "success": true,
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Background change job queued",
  "status": "processing",
  "estimated_time": 30,
  "background_id": 123,
  "photo_count": 2
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | Boolean | Indicates if request was successful |
| `job_id` | String (UUID) | Job identifier for async processing (optional) |
| `image_url` | String (URL) | Direct URL to generated image (for sync) |
| `message` | String | Human-readable status message |
| `status` | String | One of: `processing`, `completed`, `failed` |
| `estimated_time` | Integer | Estimated processing time in seconds (optional) |
| `background_id` | Integer | ID of the applied background |
| `photo_count` | Integer | Number of photos processed |
| `generated_at` | String (ISO 8601) | Timestamp of generation (optional) |

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request: photos array is required",
  "error": "VALIDATION_ERROR"
}
```

**Common Causes**:
- Missing required fields
- Invalid image format
- Photos array empty or too large
- Invalid backgroundId

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required",
  "error": "UNAUTHORIZED"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Background with ID 123 not found",
  "error": "RESOURCE_NOT_FOUND"
}
```

### 413 Payload Too Large
```json
{
  "success": false,
  "message": "Request payload exceeds maximum size",
  "error": "PAYLOAD_TOO_LARGE"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to process background change",
  "error": "INTERNAL_SERVER_ERROR"
}
```

### 503 Service Unavailable
```json
{
  "success": false,
  "message": "Background change service temporarily unavailable",
  "error": "SERVICE_UNAVAILABLE"
}
```

## Processing Flow

### Option A: Synchronous Processing (Recommended for ≤3 photos)
1. Receive request
2. Validate input
3. Process images immediately
4. Upload result to storage
5. Return `200` with `image_url`

### Option B: Asynchronous Processing (Recommended for >3 photos)
1. Receive request
2. Validate input
3. Create job in queue
4. Return `202` with `job_id`
5. Frontend polls status endpoint

## Job Status Endpoint (for async)
```
GET /v1/background-change/status/:jobId
```

### Response
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "progress": 100,
  "image_url": "https://storage.example.com/generated/uuid-123.jpg",
  "created_at": "2025-11-19T10:30:00Z",
  "completed_at": "2025-11-19T10:30:25Z"
}
```

### Status Values
- `pending` - Job queued, not started
- `processing` - Currently being processed
- `completed` - Successfully completed
- `failed` - Processing failed

## Implementation Notes

### 1. Image Processing
- Decode base64 images
- Validate image dimensions and format
- Apply background using your image processing pipeline
- Optimize output for web delivery

### 2. Storage
- Store generated images in cloud storage (S3, Azure Blob, etc.)
- Generate signed URLs with appropriate expiration
- Consider CDN for faster delivery

### 3. Performance
- Set timeout limits (e.g., 5 minutes max)
- Implement request throttling per user
- Use job queue for heavy processing (Redis, RabbitMQ, etc.)

### 4. Security
- Validate JWT token
- Sanitize base64 input
- Implement rate limiting (e.g., 10 requests/minute per user)
- Validate image content (no malicious files)

### 5. Database Schema Suggestion
```sql
CREATE TABLE background_change_jobs (
  id UUID PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  background_id INTEGER REFERENCES backgrounds(id),
  photo_count INTEGER,
  status VARCHAR(20),
  image_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

## Frontend Integration

The frontend will:
1. Send POST request with photos and backgroundId
2. If async (`job_id` returned), poll status every 2 seconds
3. Maximum 60 polling attempts (2 minutes total)
4. Display generated image or error message

## Testing

### Test Cases
1. **Valid Request**: 1 photo + valid background → Success
2. **Multiple Photos**: 5 photos + valid background → Success
3. **Invalid Background**: Photos + non-existent ID → 404
4. **Missing Auth**: No token → 401
5. **Large Payload**: 10MB+ images → 413
6. **Invalid Format**: Text file as image → 400
7. **Async Flow**: >3 photos → 202 with job_id

### Example cURL
```bash
curl -X POST https://api.example.com/v1/generate?background \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "photos": [{
      "id": "0",
      "image": "data:image/jpeg;base64,/9j/4AAQ..."
    }],
    "backgroundId": "123"
  }'
```

## Rate Limits
- **Per User**: 10 requests/minute
- **Per IP**: 50 requests/minute
- **Concurrent Jobs**: 3 per user

## Monitoring Metrics
- Request count
- Success/failure rate
- Average processing time
- Queue depth (for async)
- Storage usage

## Related Endpoints
- `GET /v1/backgrounds` - List available backgrounds
- `GET /v1/background-change/history` - User's generation history
- `DELETE /v1/background-change/:id` - Delete generation

## Contact
For questions or issues with this endpoint, contact the frontend team or refer to the main API documentation.
