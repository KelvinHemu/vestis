# Mannequin Feature Query Parameter

## Endpoint
`POST /v1/generate?mdoli`

## Purpose
The `?mdoli` query parameter is appended to the generation endpoint to indicate that the request originates from the **mannequin/on-model feature** (not flatlay).

## Frontend Implementation
- Added in `mannequinService.ts` (line 78)
- Sent with all mannequin generation requests
- Helps backend distinguish between flatlay and mannequin workflows

## Request Body
```typescript
{
  products: Array<Product>,
  modelId: string,
  backgroundId: string,  // Converted to string on frontend
  options?: GenerationOptions
}
```

## Backend Action Required
Use the `mdoli` query parameter to:
- Route requests to mannequin-specific processing pipeline
- Apply mannequin-specific business logic
- Track analytics separately for mannequin vs flatlay features
- Return mannequin-specific response format if needed

## Note
The parameter name "mdoli" is shorthand for "model" to keep URLs clean.
