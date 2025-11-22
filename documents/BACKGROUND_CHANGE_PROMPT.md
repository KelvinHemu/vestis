# Background Change - Prompt Parameter

## Summary
Added optional `prompt` field to background change generation requests to allow users to provide additional instructions.

## API Change

### Endpoint
`POST /v1/generate?background`

### Request Body
```json
{
  "photos": [
    {
      "id": "string",
      "image": "data:image/jpeg;base64,..."
    }
  ],
  "backgroundId": "string",
  "prompt": "string (optional)"
}
```

### New Field
- **`prompt`** (optional, string): Additional user instructions or details about the desired background change
  - Only included if user provides text input
  - Trimmed of whitespace before sending
  - Max length: 500 characters (enforced on frontend)

## Example Request
```json
{
  "photos": [{"id": "1", "image": "data:image/..."}],
  "backgroundId": "42",
  "prompt": "Make the lighting warmer and add subtle shadows"
}
```

## Notes
- Field is optional - existing requests without `prompt` remain valid
- Frontend validates max length of 500 characters
- Empty strings are not sent (only non-empty trimmed values)
