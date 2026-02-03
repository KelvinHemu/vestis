# Virtual Try-On Feature — Frontend Integration Guide

**For Frontend Engineers**  
Last Updated: February 1, 2026

---

## Overview

The Virtual Try-On feature allows customers to upload a photo of themselves and see how a clothing item would look on them. The shop owner pays for each try-on (2 credits), not the customer.

---

## User Flow

```
1. Customer visits product page → /shop/{slug}/items/{itemId}
2. Clicks "Try On" button (next to Buy button)
3. If not logged in → Redirect to login (return after auth)
4. Modal opens → Customer uploads full-body photo
5. Loading state → AI generates try-on image (5-15 seconds)
6. Result displayed → Customer sees themselves wearing the item
7. Image expires after 48 hours
```

---

## API Endpoint

### POST `/api/v1/shop/{slug}/items/{itemId}/tryon`

**Authentication:** Required (JWT Bearer token or session cookie)

**Content-Type:** `multipart/form-data`

### Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_photo` | File | Yes | User's photo (JPEG, PNG, or WebP, max 10MB) |

### cURL Example

```bash
curl -X POST "https://api.vestis.com/api/v1/shop/fashion-store/items/42/tryon" \
  -H "Authorization: Bearer <token>" \
  -F "user_photo=@/path/to/photo.jpg"
```

### JavaScript/Fetch Example

```javascript
async function tryOnItem(shopSlug, itemId, photoFile) {
  const formData = new FormData();
  formData.append('user_photo', photoFile);

  const response = await fetch(
    `/api/v1/shop/${shopSlug}/items/${itemId}/tryon`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new TryOnError(error.error.code, error.error.message, error.error.retry_after);
  }

  return response.json();
}
```

---

## Response Formats

### Success Response (201 Created)

```json
{
  "tryon": {
    "id": 12345,
    "image_url": "https://res.cloudinary.com/vestis/image/upload/tryon_1_2_42_1706803200.jpg",
    "expires_at": "2026-02-03T14:30:00Z",
    "item": {
      "id": 42,
      "name": "Summer Floral Dress",
      "price": 49.99,
      "currency": "USD"
    }
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "You have reached the maximum try-ons (3) for this item today.",
    "retry_after": 600
  }
}
```

---

## Error Codes Reference

| HTTP Status | Error Code | User Message | Action |
|-------------|------------|--------------|--------|
| 401 | `AUTH_REQUIRED` | "Please log in to try on items" | Redirect to login |
| 403 | `SHOP_NO_CREDITS` | "Try-on is temporarily unavailable" | Show message, hide button |
| 404 | `SHOP_NOT_FOUND` | "Shop not found" | Redirect to home |
| 404 | `ITEM_NOT_FOUND` | "Item not found" | Redirect to shop |
| 413 | `PHOTO_TOO_LARGE` | "Photo must be under 10MB" | Show file size error |
| 415 | `INVALID_PHOTO_TYPE` | "Please upload a JPEG, PNG, or WebP image" | Show format error |
| 422 | `INVALID_PHOTO` | "Could not process photo. Try a different image." | Prompt re-upload |
| 429 | `RATE_LIMIT_EXCEEDED` | Dynamic (see message) | Show countdown/message |
| 500 | `GENERATION_FAILED` | "Could not generate. Please try again." | Retry button |
| 500 | `INTERNAL_ERROR` | "Something went wrong. Please try again." | Retry button |

---

## UI Components

### 1. Try On Button (Product Page)

```tsx
// ProductPage.tsx
<div className="product-actions">
  <Button variant="primary" onClick={handleBuy}>
    Buy Now - ${item.price}
  </Button>
  <Button variant="secondary" onClick={openTryOnModal}>
    <CameraIcon /> Try On
  </Button>
</div>
```

### 2. Try On Modal

```tsx
// TryOnModal.tsx
interface TryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopSlug: string;
  item: ShopItem;
}

function TryOnModal({ isOpen, onClose, shopSlug, item }: TryOnModalProps) {
  const [step, setStep] = useState<'upload' | 'loading' | 'result' | 'error'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<TryOnResult | null>(null);
  const [error, setError] = useState<TryOnError | null>(null);

  const handleFileSelect = (file: File) => {
    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      setError({ code: 'PHOTO_TOO_LARGE', message: 'Photo must be under 10MB' });
      return;
    }
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError({ code: 'INVALID_PHOTO_TYPE', message: 'Please upload JPEG, PNG, or WebP' });
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    
    setStep('loading');
    try {
      const response = await tryOnItem(shopSlug, item.id, selectedFile);
      setResult(response.tryon);
      setStep('result');
    } catch (err) {
      setError(err);
      setStep('error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {step === 'upload' && (
        <UploadStep
          onFileSelect={handleFileSelect}
          preview={preview}
          onSubmit={handleSubmit}
          item={item}
        />
      )}
      {step === 'loading' && <LoadingStep item={item} />}
      {step === 'result' && <ResultStep result={result} item={item} onClose={onClose} />}
      {step === 'error' && <ErrorStep error={error} onRetry={() => setStep('upload')} />}
    </Modal>
  );
}
```

### 3. Upload Step

```tsx
// UploadStep.tsx
function UploadStep({ onFileSelect, preview, onSubmit, item }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="tryon-upload">
      <h2>Try On: {item.name}</h2>
      <p className="subtitle">Upload a full-body photo to see how this looks on you</p>
      
      <div className="upload-tips">
        <h4>📸 Best Results Tips:</h4>
        <ul>
          <li>Use a full-body photo (head to toe visible)</li>
          <li>Stand facing the camera</li>
          <li>Good lighting, plain background works best</li>
          <li>Wear fitted clothing for accurate results</li>
        </ul>
      </div>

      <div 
        className="dropzone"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="preview-image" />
        ) : (
          <>
            <UploadIcon size={48} />
            <p>Click or drag to upload your photo</p>
            <span className="hint">JPEG, PNG, or WebP • Max 10MB</span>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
        hidden
      />

      <div className="actions">
        <Button 
          variant="primary" 
          onClick={onSubmit} 
          disabled={!preview}
        >
          Generate Try-On
        </Button>
      </div>

      <p className="privacy-note">
        🔒 Your photo is processed securely and automatically deleted after 48 hours.
      </p>
    </div>
  );
}
```

### 4. Loading Step

```tsx
// LoadingStep.tsx
function LoadingStep({ item }) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const messages = [
    "Analyzing your photo...",
    "Understanding body proportions...",
    "Fitting the garment...",
    "Adjusting lighting and shadows...",
    "Adding final touches...",
  ];

  const messageIndex = Math.min(Math.floor(elapsedTime / 3), messages.length - 1);

  return (
    <div className="tryon-loading">
      <div className="spinner" />
      <h3>Creating Your Try-On</h3>
      <p className="status-message">{messages[messageIndex]}</p>
      <p className="time-estimate">Usually takes 10-15 seconds</p>
      
      <div className="product-preview">
        <img src={item.images[0]} alt={item.name} />
        <span>{item.name}</span>
      </div>
    </div>
  );
}
```

### 5. Result Step

```tsx
// ResultStep.tsx
function ResultStep({ result, item, onClose }) {
  const expiresAt = new Date(result.expires_at);
  const hoursRemaining = Math.round((expiresAt - new Date()) / (1000 * 60 * 60));

  return (
    <div className="tryon-result">
      <h2>Your Try-On Result</h2>
      
      <div className="result-image-container">
        <img 
          src={result.image_url} 
          alt={`You wearing ${item.name}`}
          className="result-image"
        />
      </div>

      <div className="result-info">
        <h3>{item.name}</h3>
        <p className="price">{item.currency} {item.price}</p>
      </div>

      <p className="expiry-notice">
        ⏱️ This image will be available for {hoursRemaining} hours
      </p>

      <div className="actions">
        <Button variant="primary" onClick={() => addToCart(item)}>
          Add to Cart
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Continue Shopping
        </Button>
      </div>

      <div className="secondary-actions">
        <button onClick={() => downloadImage(result.image_url)}>
          <DownloadIcon /> Save Image
        </button>
        <button onClick={() => shareImage(result.image_url)}>
          <ShareIcon /> Share
        </button>
      </div>
    </div>
  );
}
```

### 6. Error Step

```tsx
// ErrorStep.tsx
function ErrorStep({ error, onRetry }) {
  const getErrorDisplay = (error: TryOnError) => {
    switch (error.code) {
      case 'RATE_LIMIT_EXCEEDED':
        return {
          icon: <ClockIcon />,
          title: "Try-On Limit Reached",
          message: error.message,
          showRetry: false,
          showCountdown: error.retry_after > 0,
        };
      case 'PHOTO_TOO_LARGE':
      case 'INVALID_PHOTO_TYPE':
      case 'INVALID_PHOTO':
        return {
          icon: <ImageIcon />,
          title: "Photo Issue",
          message: error.message,
          showRetry: true,
        };
      case 'GENERATION_FAILED':
        return {
          icon: <AlertIcon />,
          title: "Generation Failed",
          message: "We couldn't generate your try-on. This doesn't use any credits. Please try again.",
          showRetry: true,
        };
      default:
        return {
          icon: <AlertIcon />,
          title: "Something Went Wrong",
          message: error.message || "Please try again.",
          showRetry: true,
        };
    }
  };

  const display = getErrorDisplay(error);

  return (
    <div className="tryon-error">
      <div className="error-icon">{display.icon}</div>
      <h3>{display.title}</h3>
      <p>{display.message}</p>
      
      {display.showCountdown && error.retry_after > 0 && (
        <Countdown seconds={error.retry_after} onComplete={onRetry} />
      )}

      {display.showRetry && (
        <Button variant="primary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
```

---

## State Management

### React Query Example

```typescript
// hooks/useTryOn.ts
import { useMutation } from '@tanstack/react-query';

interface TryOnParams {
  shopSlug: string;
  itemId: number;
  photo: File;
}

export function useTryOn() {
  return useMutation({
    mutationFn: async ({ shopSlug, itemId, photo }: TryOnParams) => {
      const formData = new FormData();
      formData.append('user_photo', photo);

      const response = await fetch(
        `/api/v1/shop/${shopSlug}/items/${itemId}/tryon`,
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw {
          status: response.status,
          ...data.error,
        };
      }

      return response.json();
    },
    onError: (error) => {
      // Track error analytics
      analytics.track('tryon_error', {
        code: error.code,
        message: error.message,
      });
    },
    onSuccess: (data) => {
      // Track success analytics
      analytics.track('tryon_success', {
        itemId: data.tryon.item.id,
        itemName: data.tryon.item.name,
      });
    },
  });
}
```

### Usage in Component

```tsx
function TryOnModal({ shopSlug, item }) {
  const tryOn = useTryOn();

  const handleSubmit = (file: File) => {
    tryOn.mutate(
      { shopSlug, itemId: item.id, photo: file },
      {
        onSuccess: (data) => setResult(data.tryon),
        onError: (error) => setError(error),
      }
    );
  };

  return (
    // ... JSX using tryOn.isPending, tryOn.isError, etc.
  );
}
```

---

## Authentication Handling

### Check Auth Before Opening Modal

```typescript
function handleTryOnClick() {
  if (!isAuthenticated) {
    // Save intent to return after login
    sessionStorage.setItem('tryon_intent', JSON.stringify({
      shopSlug,
      itemId: item.id,
    }));
    
    // Redirect to login
    router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    return;
  }
  
  openTryOnModal();
}
```

### Resume After Login

```typescript
// After successful login
useEffect(() => {
  const intent = sessionStorage.getItem('tryon_intent');
  if (intent) {
    const { shopSlug, itemId } = JSON.parse(intent);
    sessionStorage.removeItem('tryon_intent');
    // Open try-on modal for the saved item
    openTryOnModal(shopSlug, itemId);
  }
}, [isAuthenticated]);
```

---

## Image Handling

### Download Try-On Image

```typescript
async function downloadImage(imageUrl: string, fileName: string = 'tryon.jpg') {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
  }
}
```

### Share Try-On Image

```typescript
async function shareImage(imageUrl: string, itemName: string) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Check out how I look in ${itemName}!`,
        url: imageUrl,
      });
    } catch (error) {
      // User cancelled or share failed
      fallbackShare(imageUrl);
    }
  } else {
    fallbackShare(imageUrl);
  }
}

function fallbackShare(imageUrl: string) {
  navigator.clipboard.writeText(imageUrl);
  toast.success('Image link copied to clipboard!');
}
```

---

## Styling (CSS)

```css
/* tryon-modal.css */

.tryon-modal {
  max-width: 500px;
  width: 100%;
  padding: 24px;
}

.tryon-upload .dropzone {
  border: 2px dashed #ccc;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

.tryon-upload .dropzone:hover {
  border-color: #007bff;
  background-color: #f8f9ff;
}

.tryon-upload .dropzone.drag-over {
  border-color: #007bff;
  background-color: #e8f0ff;
}

.tryon-upload .preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
}

.tryon-upload .upload-tips {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.tryon-upload .upload-tips ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.tryon-loading {
  text-align: center;
  padding: 40px 20px;
}

.tryon-loading .spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.tryon-result .result-image {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.tryon-result .expiry-notice {
  color: #666;
  font-size: 14px;
  margin: 16px 0;
}

.tryon-error {
  text-align: center;
  padding: 40px 20px;
}

.tryon-error .error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.privacy-note {
  font-size: 12px;
  color: #888;
  margin-top: 16px;
}
```

---

## Analytics Events

Track these events for product insights:

| Event | When | Properties |
|-------|------|------------|
| `tryon_button_clicked` | User clicks Try On button | `item_id`, `shop_slug` |
| `tryon_modal_opened` | Modal opens | `item_id`, `authenticated` |
| `tryon_photo_selected` | Photo selected | `file_size`, `file_type` |
| `tryon_submitted` | Form submitted | `item_id` |
| `tryon_success` | Generation completed | `item_id`, `generation_time_ms` |
| `tryon_error` | Error occurred | `error_code`, `error_message` |
| `tryon_result_downloaded` | User downloads result | `item_id` |
| `tryon_result_shared` | User shares result | `item_id`, `share_method` |
| `tryon_to_cart` | User adds item after try-on | `item_id`, `price` |

---

## Testing Checklist

- [ ] Upload valid JPEG, PNG, WebP files
- [ ] Reject files > 10MB with clear error
- [ ] Reject non-image files
- [ ] Handle unauthenticated users (redirect to login)
- [ ] Display loading state for 10-15 seconds
- [ ] Show result image correctly
- [ ] Handle rate limit errors with countdown
- [ ] Handle generation failures gracefully
- [ ] Download button works
- [ ] Share button works (native + fallback)
- [ ] Modal closes properly
- [ ] Mobile responsiveness
- [ ] Keyboard accessibility (Escape to close, Tab navigation)

---

## Questions?

Contact the backend team if you need:
- Test shop slug and item IDs for development
- Test user accounts with credits
- Clarification on any error codes
