# Frontend Quick Reference - Async API

## 🚀 TL;DR

**Before:** API blocked for 2-3 minutes
**Now:** API returns instantly, poll for results

## 📋 Checklist

- [ ] Update all `/generate` calls to expect `202 Accepted` + `job_id`
- [ ] Implement polling function (poll every 2 seconds)
- [ ] Add loading/progress UI
- [ ] Handle completed jobs (show `image_url`)
- [ ] Handle failed jobs (show error)
- [ ] Test end-to-end flow

## 🔄 Basic Flow

```javascript
// 1. Create job (instant!)
const { job_id } = await fetch('/api/v1/generate?chat=true', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ prompt: "..." })
}).then(r => r.json());

// 2. Poll for result
let completed = false;
while (!completed) {
  const job = await fetch(`/api/v1/jobs/${job_id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  
  if (job.status === 'completed') {
    console.log('Image URL:', job.result.image_url);
    completed = true;
  } else if (job.status === 'failed') {
    throw new Error(job.error);
  } else {
    await new Promise(r => setTimeout(r, 2000)); // Wait 2 seconds
  }
}
```

## 📦 Copy-Paste Utilities

### Polling Function

```javascript
// Copy this into your project
export const pollJobStatus = async (jobId, token) => {
  const maxAttempts = 150; // 5 minutes max
  const interval = 2000; // 2 seconds
  
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`/api/v1/jobs/${jobId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const job = await response.json();
    
    if (job.status === 'completed') {
      return job.result.image_url;
    }
    
    if (job.status === 'failed') {
      throw new Error(job.error || 'Generation failed');
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('Timeout: Generation took too long');
};
```

### Generate Function

```javascript
// Copy this into your project
export const generateImage = async (type, payload, token) => {
  // Step 1: Create job
  const queryParam = type !== 'legacy' ? `?${type}=true` : '';
  const response = await fetch(`/api/v1/generate${queryParam}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create job');
  }
  
  const { job_id } = await response.json();
  
  // Step 2: Poll for result
  return await pollJobStatus(job_id, token);
};

// Usage:
const imageUrl = await generateImage('chat', { 
  prompt: 'A professional logo' 
}, token);
```

## 🎯 React Hook (Copy-Paste Ready)

```javascript
import { useState } from 'react';

export const useImageGeneration = (token) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState(null);

  const generate = async (type, payload) => {
    setLoading(true);
    setError(null);
    setProgress('Creating job...');

    try {
      // Create job
      const res = await fetch(`/api/v1/generate?${type}=true`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const { job_id } = await res.json();
      
      setProgress('Waiting for processing...');

      // Poll for result
      for (let i = 0; i < 150; i++) {
        const jobRes = await fetch(`/api/v1/jobs/${job_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const job = await jobRes.json();

        if (job.status === 'processing') {
          setProgress('Generating image (2-3 min)...');
        }

        if (job.status === 'completed') {
          setProgress('Complete!');
          return job.result.image_url;
        }

        if (job.status === 'failed') {
          throw new Error(job.error);
        }

        await new Promise(r => setTimeout(r, 2000));
      }

      throw new Error('Timeout');

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, progress, error };
};

// Usage in component:
const { generate, loading, progress } = useImageGeneration(token);
const imageUrl = await generate('chat', { prompt: 'test' });
```

## 📱 All Endpoints

| Old Endpoint | New Endpoint | Type |
|--------------|--------------|------|
| `POST /generate?chat=true` | Same | `chat` |
| `POST /generate?flatlay=true` | Same | `flatlay` |
| `POST /generate?mdoli=true` | Same | `mannequin` |
| `POST /generate?onmodel=true` | Same | `onmodel` |
| `POST /generate?background=true` | Same | `background` |
| `POST /generate` | Same | `legacy` |

**New endpoints:**
- `GET /api/v1/jobs/{id}` - Get job status
- `GET /api/v1/jobs` - List all jobs
- `DELETE /api/v1/jobs/{id}` - Cancel job

## 🎨 Status Badges (CSS)

```css
.status-pending { background: #FF9800; color: white; }
.status-processing { background: #2196F3; color: white; }
.status-completed { background: #4CAF50; color: white; }
.status-failed { background: #F44336; color: white; }
```

## 🔧 Request Examples

### Chat Generation
```javascript
POST /api/v1/generate?chat=true
{
  "prompt": "Create a modern logo",
  "images": []
}
→ { "job_id": 123, "status": "pending" }
```

### Flatlay Generation
```javascript
POST /api/v1/generate?flatlay=true
{
  "modelId": "1",
  "backgroundId": "1",
  "products": [
    {
      "type": "top",
      "frontImage": "base64...",
      "backImage": "base64..."
    }
  ]
}
→ { "job_id": 124, "status": "pending" }
```

### Check Status
```javascript
GET /api/v1/jobs/123
→ {
  "job_id": 123,
  "status": "completed",
  "result": {
    "image_url": "https://cloudinary.com/...",
    "generated_at": "2024-01-15T10:32:25Z",
    "message": "Chat image generated successfully"
  }
}
```

## ⚠️ Common Mistakes

❌ **Don't wait for 200 OK**
```javascript
// WRONG - This won't work anymore
const { image_url } = await response.json();
```

✅ **Do check for 202 Accepted**
```javascript
// CORRECT
if (response.status === 202) {
  const { job_id } = await response.json();
  // Then poll for result
}
```

❌ **Don't poll too frequently**
```javascript
// WRONG - Too fast, wastes resources
await new Promise(r => setTimeout(r, 100));
```

✅ **Do poll every 2 seconds**
```javascript
// CORRECT
await new Promise(r => setTimeout(r, 2000));
```

## 🐛 Troubleshooting

**Q: Jobs stay "pending" forever**
- Check if backend workers are running
- Check server logs for errors

**Q: "Job not found" error**
- Verify job_id is correct
- Check if job was created successfully

**Q: Polling times out**
- Normal processing: 2-3 minutes
- Max timeout: 5 minutes
- If longer, check server capacity

**Q: 401 Unauthorized**
- Token expired, refresh auth
- Include `Authorization: Bearer {token}` header

## 📞 Need Help?

1. Check full guide: `FRONTEND_INTEGRATION_GUIDE.md`
2. Check backend docs: `ASYNC_JOB_QUEUE_IMPLEMENTATION.md`
3. Ask backend team about job status

## ✅ Testing Checklist

```javascript
// Test this flow works:
const token = "your_token";

// 1. Create job
const { job_id } = await fetch('/api/v1/generate?chat=true', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'test' })
}).then(r => r.json());

console.log('Job created:', job_id);

// 2. Check status immediately (should be pending)
const job1 = await fetch(`/api/v1/jobs/${job_id}`, {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

console.log('Status:', job1.status); // Should be "pending" or "processing"

// 3. Wait 3 minutes and check again (should be completed)
await new Promise(r => setTimeout(r, 180000));

const job2 = await fetch(`/api/v1/jobs/${job_id}`, {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

console.log('Final status:', job2.status); // Should be "completed"
console.log('Image URL:', job2.result?.image_url);
```

---

**That's it!** Copy the utilities, update your API calls, add polling, and you're done! 🎉

