# Chat Generation API Documentation

## Overview
The chat generation feature allows users to create images by providing a text prompt and optionally uploading reference images. This document describes the API endpoint requirements for backend implementation.

## Endpoint

### Generate Image from Chat
**POST** `/v1/generate`

Generate an image based on a text prompt and optional reference images.

## Request Format

### Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Request Body
```json
{
  "prompt": "string (required)",
  "images": ["string[] (optional)"]
}
```

### Fields Description
- **prompt** (string, required): The text description of what the user wants to generate. Can be any natural language description (e.g., "Create a red t-shirt on a white background").
- **images** (array of strings, optional): Array of base64-encoded images. These images serve as reference/context for the generation. Empty array if no images provided.

### Example Request
```json
{
  "prompt": "Create a flatlay photo with a blue denim jacket and white sneakers on a wooden background",
  "images": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA..."
  ]
}
```

### Example Request (No Images)
```json
{
  "prompt": "Generate a fashion model wearing a black dress",
  "images": []
}
```

## Response Format

### Success Response (200 OK)
```json
{
  "success": true,
  "job_id": "string",
  "image_url": "string",
  "message": "string (optional)",
  "estimated_time": number (optional),
  "status": "completed",
  "generated_at": "ISO 8601 timestamp (optional)"
}
```

### Response Fields Description
- **success** (boolean): Indicates if the generation was successful
- **job_id** (string): Unique identifier for the generation job
- **image_url** (string): **Direct URL to the generated image** - This is the primary response field
- **message** (string, optional): Human-readable message about the generation
- **estimated_time** (number, optional): Estimated time in seconds (for future polling feature)
- **status** (string): Generation status - should be "completed" for synchronous generation
- **generated_at** (string, optional): ISO 8601 timestamp of when the image was generated

### Example Success Response
```json
{
  "success": true,
  "job_id": "gen_1234567890",
  "image_url": "https://storage.example.com/generated/image_abc123.jpg",
  "message": "Image generated successfully",
  "status": "completed",
  "generated_at": "2025-11-19T10:30:00Z"
}
```

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "message": "string",
  "error": "string (optional)"
}
```

### Example Error Response
```json
{
  "success": false,
  "message": "Failed to generate image: Invalid prompt",
  "error": "INVALID_PROMPT"
}
```

## Implementation Notes

### Current Behavior
- Frontend expects **synchronous generation** - image should be generated and returned immediately
- The `image_url` field must contain a valid, accessible URL to the generated image
- Frontend does **NOT** implement polling yet (planned for future)

### Future Considerations
- **Polling Support**: Future versions will support async generation with job polling
  - Response would return `status: "pending"` or `status: "processing"`
  - Frontend would poll `GET /v1/generate/status/{job_id}` endpoint
  - Not required for current implementation

### Authentication
- All requests include `Authorization: Bearer {token}` header
- Backend should validate the token and reject unauthorized requests with 401

### Image Format
- Frontend sends images as base64 data URIs (e.g., `data:image/jpeg;base64,...`)
- Backend can decode and process these as needed
- Supported formats: JPEG, PNG, WebP

### Response Image URL
- Must be a publicly accessible URL (HTTPS recommended)
- Should remain valid for reasonable duration
- Can be CDN URL, object storage URL, or direct server URL

## Error Handling

### Common Error Scenarios
| Status Code | Scenario | Example Message |
|-------------|----------|-----------------|
| 400 | Missing or invalid prompt | "Prompt is required" |
| 400 | Invalid image format | "Invalid image data provided" |
| 401 | Invalid or expired token | "Authentication required" |
| 413 | Payload too large | "Image size exceeds limit" |
| 429 | Rate limit exceeded | "Too many requests" |
| 500 | Generation failed | "Failed to generate image" |
| 503 | Service unavailable | "Generation service temporarily unavailable" |

## Frontend Implementation Reference
- Service: `src/services/chatService.ts`
- Component: `src/components/CreatePage.tsx`
- Input: `src/components/FloatingAskBar.tsx`
