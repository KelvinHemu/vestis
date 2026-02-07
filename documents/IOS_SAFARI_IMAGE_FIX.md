# iOS Safari Image Display & Download Fix

## Issue

On **iPhone 15 Pro Max** (and potentially other iOS Safari devices), two features on the Flatlay generation page were broken:

1. **Generated image not displaying** — After a flatlay image was generated, the image container appeared empty/black with only a broken image icon visible.
2. **Download button not working** — Tapping "Download" did nothing; the image was never saved to the device.

Both features worked correctly on all other tested devices (Android phones, desktop browsers, other iPhones).

---

## Root Cause

### Image Display

iOS Safari has stricter **cross-origin image rendering** policies. When the backend API returns a remote image URL (e.g. from S3 or cloud storage), Safari may silently refuse to render it in a plain `<img>` tag due to CORS restrictions. The image data is fetched by the browser but not painted to the screen.

### Download

iOS Safari **does not support** the `download` attribute on `<a>` elements. The standard web download pattern:

```js
const link = document.createElement('a');
link.href = blobUrl;
link.download = 'filename.png';
link.click();
```

is silently ignored on iOS Safari. The `click()` event fires but no download is initiated. Additionally, `URL.revokeObjectURL()` was called immediately after `link.click()`, destroying the blob URL before Safari had any chance to act on it.

---

## Solution

### Image Display Fix

**Strategy:** Lazy blob fallback — zero performance overhead on normal browsers.

Instead of eagerly converting every image URL to a blob (which doubles network requests), we let the `<img>` tag load the remote URL directly. Only if it **fails** (via the `onError` event), we fetch the image as a blob and create a local `blob:` object URL.

```tsx
// State for fallback
const [fallbackBlobUrl, setFallbackBlobUrl] = useState<string | null>(null);
const blobUrlRef = useRef<string | null>(null);

// Reset when image changes
useEffect(() => {
  setFallbackBlobUrl(null);
  if (blobUrlRef.current) {
    URL.revokeObjectURL(blobUrlRef.current);
    blobUrlRef.current = null;
  }
}, [generatedImageUrl]);

// Only called when <img> fails to load
const handleImageError = () => {
  if (fallbackBlobUrl || !generatedImageUrl) return;
  if (generatedImageUrl.startsWith('data:') || generatedImageUrl.startsWith('blob:')) return;

  fetch(generatedImageUrl, { mode: 'cors' })
    .then(res => res.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      setFallbackBlobUrl(url);
    })
    .catch(() => console.warn('iOS image fallback failed'));
};

// In JSX
<img
  src={fallbackBlobUrl || generatedImageUrl}
  crossOrigin="anonymous"
  onError={handleImageError}
/>
```

**Why this works:**
- `blob:` URLs are treated as **same-origin** by iOS Safari, bypassing CORS rendering restrictions.
- The `onError` handler only fires on iOS (or other browsers where the image fails), so there is **zero extra network cost** on browsers where the image loads fine.
- Memory is properly cleaned up via `URL.revokeObjectURL()` on unmount and when the image URL changes.

### Download Fix

**Strategy:** Detect iOS and open the image in a new tab instead of using `link.click()`.

```tsx
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

if (isIOS) {
  // Opens image in new tab → user long-presses → "Save to Photos"
  window.open(blobUrl, '_blank');
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
} else {
  // Standard download for non-iOS
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = 'flatlay-image.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}
```

**Why this works:**
- `window.open()` is not blocked by iOS Safari's download restrictions.
- The user sees the full image in a new tab and can long-press → "Add to Photos" or use the native share sheet.
- `revokeObjectURL` is deferred (60s on iOS, 1s on others) so the blob stays alive long enough for the new tab to load.
- If the `fetch()` itself fails, the catch block falls back to `window.open(originalUrl, '_blank')`.

---

## Files Modified

| File | Changes |
|------|---------|
| `src/features/generation/components/FlatLayPhotos.tsx` | Image fallback + download fix (primary component used by the app) |
| `src/components/FlatLayPhotos.tsx` | Image fallback + download fix (secondary/legacy component) |
| `src/components/ui/FullscreenImageViewer.tsx` | Added `crossOrigin="anonymous"` to `<img>` tag |

---

## iOS Detection

The iOS check covers:

| Check | Catches |
|-------|---------|
| `/iPad\|iPhone\|iPod/.test(navigator.userAgent)` | Standard iPhones and iPads |
| `navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1` | iPads running iPadOS 13+ (which reports as Mac in user agent) |

---

## Testing Checklist

- [ ] **iPhone 15 Pro Max (Safari)** — Generated image displays correctly
- [ ] **iPhone 15 Pro Max (Safari)** — Download opens image in new tab for saving
- [ ] **Android (Chrome)** — Image displays normally, download triggers file save
- [ ] **Desktop (Chrome/Firefox/Safari)** — No behavior change, image displays and downloads normally
- [ ] **iPad (Safari)** — Image displays and download works via new tab
- [ ] **Memory** — Blob URLs are revoked on component unmount (check DevTools)

---

## Notes

- The `crossOrigin="anonymous"` attribute on `<img>` tags is necessary for CORS-enabled image fetching but alone is not sufficient to fix the iOS rendering issue — the blob fallback is still required.
- The secondary component at `src/components/FlatLayPhotos.tsx` appears to be a legacy version. The app routes use `src/features/generation/components/FlatLayPhotos.tsx`. Both were patched for consistency.
