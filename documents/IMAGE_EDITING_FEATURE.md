# Image Editing API - Backend Integration Guide

## Overview
Frontend supports iterative image editing by including the previously generated image in subsequent requests. Each edit builds upon the previous result through the same generation endpoint.

## API Endpoint

### POST `/v1/generate?chat=true`

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "prompt": "string (required)",
  "images": ["string array (optional)"]
}
```

**Response Body:**
```json
{
  "success": true,
  "job_id": "uuid",
  "image_url": "https://...",
  "status": "completed",
  "message": "optional error message",
  "estimated_time": 0,
  "generated_at": "2025-11-19T..."
}
```

## Image Format Support

The `images` array accepts:
- **HTTP(S) URLs**: `"https://example.com/image.jpg"`
- **Base64 Data URIs**: `"data:image/png;base64,iVBORw0KGgo..."`

**Important**: Backend must handle both formats. The first image in the array is the source image for editing.

## Editing Workflow

### Initial Generation
```json
POST /v1/generate?chat=true
{
  "prompt": "A red dress on white background",
  "images": []
}
```

### First Edit
```json
POST /v1/generate?chat=true
{
  "prompt": "Make it blue",
  "images": ["https://cdn.example.com/generated-image-1.jpg"]
}
```

### Subsequent Edits
```json
POST /v1/generate?chat=true
{
  "prompt": "Add sleeves",
  "images": ["https://cdn.example.com/generated-image-2.jpg"]
}
```

## Key Implementation Notes

1. **Same Endpoint**: Editing uses the same endpoint as initial generation
2. **Image Order**: First image in array = source image for editing
3. **Multiple Images**: Additional images can be provided for context
4. **URL Handling**: Backend must fetch and process image URLs
5. **Idempotency**: Each request should be independent
6. **Error Handling**: Return descriptive error messages in `message` field
7. **Status Field**: Must return current job status

## Expected Backend Behavior

- Accept image URLs and fetch them server-side
- Accept base64 encoded images directly
- Process the first image as the primary source for editing
- Apply the text prompt as modification instructions
- Return the new generated image URL
- Maintain consistent response format for both new generations and edits
