# Aspect Ratio & Resolution - Backend Specification

## Frontend → Backend Format

The frontend sends `aspectRatio` and `resolution` as **strings** in all generation requests.

### Example Payload

```json
{
  "products": [...],
  "modelId": "model-123",
  "backgroundId": "bg-456",
  "aspectRatio": "16:9",
  "resolution": "2K"
}
```

### Field Specifications

**`aspectRatio`** (optional string)
- Valid values: `"1:1"`, `"2:3"`, `"3:2"`, `"3:4"`, `"4:3"`, `"4:5"`, `"5:4"`, `"9:16"`, `"16:9"`, `"21:9"`, `"auto"`
- Default if not provided: `"3:4"`

**`resolution`** (optional string)
- Valid values: `"1K"`, `"2K"`, `"4K"`
- Default if not provided: `"2K"`

### Endpoints Affected

- `POST /v1/generate?flatlay` - FlatLay generation
- `POST /v1/generate?mdoli` - Mannequin generation  
- `POST /v1/generate?onmodel` - On-Model photos
- `POST /v1/generate?background` - Background change

### Backend Requirements

1. Parse `aspectRatio` and `resolution` from request body
2. Apply defaults if missing
3. Use values to configure image generation dimensions
4. No changes needed to response format
