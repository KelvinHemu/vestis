# Aspect Ratio & Resolution API Changes

## Overview
Frontend now sends `aspectRatio` and `resolution` parameters in image generation requests for both FlatLay and Mannequin features.

## API Changes

### Request Payload
The `/v1/generate` endpoint now accepts two additional optional fields:

```json
{
  "products": [...],
  "modelId": "string",
  "backgroundId": "string",
  "aspectRatio": "string",  // NEW
  "resolution": "string",   // NEW
  "options": {
    "quality": "high",
    "format": "png"
  }
}
```

### New Parameters

#### `aspectRatio` (optional string)
Defines the aspect ratio for the generated image.

**Possible values:**
- `"auto"` - Default to 3:4 if not specified
- `"1:1"` - Square
- `"2:3"` - Portrait
- `"3:2"` - Landscape
- `"3:4"` - Portrait (default)
- `"4:3"` - Landscape
- `"4:5"` - Portrait
- `"5:4"` - Landscape
- `"9:16"` - Portrait (mobile)
- `"16:9"` - Landscape (widescreen)
- `"21:9"` - Ultra-wide

#### `resolution` (optional string)
Defines the resolution quality for the generated image.

**Possible values:**
- `"1K"` - Low resolution
- `"2K"` - Medium resolution (default)
- `"4K"` - High resolution

## Expected Backend Behavior

1. **Parse Parameters**: Extract `aspectRatio` and `resolution` from request body
2. **Apply Defaults**: 
   - If `aspectRatio` is `"auto"` or missing, use `"3:4"`
   - If `resolution` is missing, use `"2K"`
3. **Generate Image**: Use these parameters to configure the image generation dimensions
4. **Return Response**: Standard response format remains unchanged

## Example Request

```bash
POST /v1/generate?flatlay
Content-Type: application/json

{
  "products": [
    {
      "type": "top",
      "frontImage": "data:image/jpeg;base64,..."
    }
  ],
  "modelId": "model-123",
  "backgroundId": "bg-456",
  "aspectRatio": "16:9",
  "resolution": "4K",
  "options": {
    "quality": "high",
    "format": "png"
  }
}
```

## Frontend Changes

- User can select aspect ratio from dropdown in right panel
- User can select resolution from dropdown in right panel
- Selected values are sent with every generation request
- Frontend displays generated image with matching aspect ratio

## Notes

- Both parameters are **optional** for backward compatibility
- Frontend will always send these parameters going forward
- Format is consistent across both FlatLay and Mannequin endpoints
