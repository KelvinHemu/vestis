# Frontend Migration Guide - From Sync to Async

## 🎯 Purpose

This guide shows you **exactly** what to change in your existing React code to support the new async job queue system.

## 📊 Migration Overview

| Aspect | Before (Sync) | After (Async) | Effort |
|--------|---------------|---------------|--------|
| API Call | Direct await | Create job + poll | Medium |
| Response Time | 2-3 minutes | Instant | None |
| Loading State | Simple boolean | Progress tracking | Low |
| Error Handling | Catch errors | Catch + job errors | Low |
| User Experience | Blocked UI | Progressive updates | Medium |

## 🔄 Step-by-Step Migration

### Step 1: Update API Service Function

**BEFORE (Synchronous):**
```javascript
// src/services/api.js - OLD CODE

export const generateChatImage = async (prompt, images, token) => {
  const response = await fetch('/api/v1/generate?chat=true', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, images }),
  });

  if (!response.ok) {
    throw new Error('Generation failed');
  }

  const result = await response.json();
  return result.image_url; // Returns after 2-3 minutes
};
```

**AFTER (Asynchronous):**
```javascript
// src/services/api.js - NEW CODE

// Helper function to poll job status
const pollJobStatus = async (jobId, token, onProgress) => {
  const maxAttempts = 150; // 5 minutes max (150 * 2s)
  const interval = 2000; // 2 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`/api/v1/jobs/${jobId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const job = await response.json();

    // Notify progress
    if (onProgress) {
      onProgress(job);
    }

    // Check if completed
    if (job.status === 'completed') {
      return job.result.image_url;
    }

    // Check if failed
    if (job.status === 'failed') {
      throw new Error(job.error || 'Generation failed');
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error('Generation timed out');
};

export const generateChatImage = async (prompt, images, token, onProgress) => {
  // Step 1: Create the job (instant response)
  const response = await fetch('/api/v1/generate?chat=true', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, images }),
  });

  if (!response.ok) {
    throw new Error('Failed to create job');
  }

  const { job_id } = await response.json();

  // Step 2: Poll for completion
  return await pollJobStatus(job_id, token, onProgress);
};
```

**What Changed:**
- ✅ Added `pollJobStatus` helper function
- ✅ Added optional `onProgress` callback
- ✅ Split into two steps: create job + poll
- ✅ Return value is the same (`image_url`)

### Step 2: Update React Component

**BEFORE (Synchronous):**
```jsx
// src/components/ChatGenerator.jsx - OLD CODE

import React, { useState } from 'react';
import { generateChatImage } from '../services/api';

export const ChatGenerator = ({ token }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      // This blocks for 2-3 minutes
      const url = await generateChatImage(prompt, [], token);
      setImageUrl(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={loading}
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate'}
      </button>

      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {imageUrl && <img src={imageUrl} alt="Generated" />}
    </div>
  );
};
```

**AFTER (Asynchronous):**
```jsx
// src/components/ChatGenerator.jsx - NEW CODE

import React, { useState } from 'react';
import { generateChatImage } from '../services/api';

export const ChatGenerator = ({ token }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null); // NEW: Track progress
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setProgress({ status: 'creating', message: 'Creating job...' }); // NEW

    try {
      // Pass progress callback
      const url = await generateChatImage(
        prompt, 
        [], 
        token,
        (job) => { // NEW: Progress callback
          setProgress({
            status: job.status,
            message: getStatusMessage(job.status),
          });
        }
      );
      
      setImageUrl(url);
      setProgress({ status: 'completed', message: 'Complete!' }); // NEW
    } catch (err) {
      setError(err.message);
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Helper to get user-friendly messages
  const getStatusMessage = (status) => {
    const messages = {
      pending: 'Waiting in queue...',
      processing: 'Generating image (this may take 2-3 minutes)...',
      completed: 'Complete!',
    };
    return messages[status] || 'Processing...';
  };

  return (
    <div>
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={loading}
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate'}
      </button>

      {/* UPDATED: Show progress instead of simple loading */}
      {loading && progress && (
        <div className="progress">
          <div className="spinner" />
          <p>{progress.message}</p>
        </div>
      )}

      {error && <div>Error: {error}</div>}
      {imageUrl && <img src={imageUrl} alt="Generated" />}
    </div>
  );
};
```

**What Changed:**
- ✅ Added `progress` state to track job status
- ✅ Pass progress callback to API function
- ✅ Show detailed progress messages
- ✅ Everything else stays the same!

### Step 3: Update All Other Generation Types

The same pattern applies to all generation types. Here's a template:

**Template for Any Generation Type:**

```javascript
// BEFORE:
const url = await generateImage(params);

// AFTER:
const url = await generateImage(params, (job) => {
  setProgress({
    status: job.status,
    message: getStatusMessage(job.status),
  });
});
```

**Example: Flatlay Generation**

```jsx
// BEFORE:
const handleGenerate = async () => {
  setLoading(true);
  try {
    const url = await generateFlatlay({
      modelId: '1',
      backgroundId: '1',
      products: [...]
    }, token);
    setImageUrl(url);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

// AFTER:
const handleGenerate = async () => {
  setLoading(true);
  setProgress({ status: 'creating', message: 'Creating job...' });
  
  try {
    const url = await generateFlatlay({
      modelId: '1',
      backgroundId: '1',
      products: [...]
    }, token, (job) => {
      setProgress({ status: job.status, message: getStatusMessage(job.status) });
    });
    setImageUrl(url);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

## 🎨 Optional: Enhanced Progress UI

You can optionally add a more sophisticated progress indicator:

```jsx
// src/components/ProgressIndicator.jsx

export const ProgressIndicator = ({ progress }) => {
  if (!progress) return null;

  const getPercentage = () => {
    switch (progress.status) {
      case 'creating': return 10;
      case 'pending': return 25;
      case 'processing': return 60;
      case 'completed': return 100;
      default: return 0;
    }
  };

  return (
    <div className="progress-indicator">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${getPercentage()}%` }}
        />
      </div>
      <p className="progress-message">{progress.message}</p>
    </div>
  );
};

// Use in component:
{loading && <ProgressIndicator progress={progress} />}
```

```css
/* styles.css */

.progress-indicator {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  margin: 20px 0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #81C784);
  transition: width 0.5s ease;
}

.progress-message {
  margin: 0;
  color: #666;
  font-size: 14px;
}
```

## 🔧 Minimal Migration (Quick Fix)

If you want the **absolute minimum changes**, you can keep most of your code the same by hiding the complexity:

**Create a compatibility wrapper:**

```javascript
// src/services/compatApi.js

import { generateChatImage as asyncGenerateChatImage } from './api';

// Wrapper that hides the async complexity
export const generateChatImage = async (prompt, images, token) => {
  // Just await the async version without progress callback
  return await asyncGenerateChatImage(prompt, images, token);
};

// Use same wrapper pattern for other functions
export const generateFlatlay = async (params, token) => {
  return await asyncGenerateFlatlay(params, token);
};
```

Then you don't need to change your components at all! But you lose progress updates.

## 📋 Migration Checklist

### For Each Component That Generates Images:

- [ ] Import updated API function
- [ ] Add `progress` state (optional but recommended)
- [ ] Add progress callback to API call
- [ ] Update loading UI to show progress
- [ ] Test that generation still works
- [ ] Test that errors are handled
- [ ] Verify timeout works (should fail after 5 min)

### Files to Update:

- [ ] `src/services/api.js` - Add polling logic
- [ ] `src/components/ChatGenerator.jsx`
- [ ] `src/components/FlatlayGenerator.jsx`
- [ ] `src/components/OnModelGenerator.jsx`
- [ ] `src/components/BackgroundChanger.jsx`
- [ ] Any other components that call generation APIs

## 🧪 Testing Your Changes

### Test 1: Basic Generation

```javascript
// Should work exactly as before, just with progress updates
const url = await generateChatImage('test', [], token, (job) => {
  console.log('Progress:', job.status);
});
console.log('Result:', url);
```

### Test 2: Error Handling

```javascript
// Should still catch errors properly
try {
  await generateChatImage('', [], token);
} catch (err) {
  console.log('Error caught:', err.message); // ✅ Should catch
}
```

### Test 3: Multiple Concurrent Jobs

```javascript
// Should work - jobs are independent
const [url1, url2] = await Promise.all([
  generateChatImage('prompt 1', [], token),
  generateChatImage('prompt 2', [], token),
]);
```

## ⚠️ Common Issues

### Issue 1: "Job not found" Error

**Cause:** Job ID not being passed correctly
**Fix:** Check that `job_id` from create response is used in polling

### Issue 2: Infinite Polling

**Cause:** Missing `maxAttempts` check
**Fix:** Ensure polling has timeout (150 attempts = 5 minutes)

### Issue 3: Progress Not Updating

**Cause:** Progress callback not being called
**Fix:** Verify callback is passed and called in `pollJobStatus`

### Issue 4: UI Freezing

**Cause:** Await in tight loop without delay
**Fix:** Ensure `setTimeout` between polls (2 seconds)

## 🎉 Success Criteria

Your migration is successful when:

✅ Users see "Creating job..." message immediately
✅ Progress updates show during generation
✅ Final image appears after 2-3 minutes
✅ Errors are caught and displayed
✅ Multiple generations work simultaneously
✅ Users can navigate away and back (if you implement recovery)

## 📞 Need Help?

1. **Full React examples**: `FRONTEND_INTEGRATION_GUIDE.md`
2. **Quick utilities**: `FRONTEND_QUICK_REFERENCE.md`
3. **Backend details**: `ASYNC_JOB_QUEUE_IMPLEMENTATION.md`

## 📝 Example Pull Request Description

```markdown
## Migration to Async Generation API

### Changes
- Updated all generation API calls to use new async job queue
- Added progress tracking for better UX
- Users now see real-time status updates during generation

### Testing
- [x] Chat generation works
- [x] Flatlay generation works
- [x] Error handling works
- [x] Progress updates display correctly
- [x] Timeout works after 5 minutes

### Breaking Changes
None for users - same functionality, better UX

### Rollback Plan
If issues occur, revert to commit [previous commit hash]
Backend supports both sync and async if needed
```

---

**That's it!** Follow these steps and your React app will be fully compatible with the new async API. The changes are minimal and the benefits are huge! 🚀

