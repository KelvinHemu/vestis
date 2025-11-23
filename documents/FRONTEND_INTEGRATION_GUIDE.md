# Frontend Integration Guide - Async Job Queue

## 🎯 Overview for Frontend Developers

The Vestis API has been upgraded from synchronous to asynchronous image generation. This means:

**Before (Synchronous):**
```javascript
// Old way - blocked for 2-3 minutes
const response = await fetch('/api/v1/generate?chat=true', {
  method: 'POST',
  body: JSON.stringify({ prompt: "..." })
});
const { image_url } = await response.json(); // ⏳ Waits 2-3 minutes
```

**After (Asynchronous):**
```javascript
// New way - instant response, then poll for results
const response = await fetch('/api/v1/generate?chat=true', {
  method: 'POST',
  body: JSON.stringify({ prompt: "..." })
});
const { job_id } = await response.json(); // ✅ Returns immediately!

// Poll for completion
const result = await pollJobStatus(job_id); // Poll every 2 seconds
const image_url = result.image_url;
```

## 🔄 Breaking Changes

### 1. Response Status Changed
- **Old**: `200 OK` with immediate result
- **New**: `202 Accepted` with `job_id`

### 2. Response Structure Changed
- **Old**: `{ success: true, image_url: "...", ... }`
- **New**: `{ success: true, job_id: 123, status: "pending", message: "..." }`

### 3. Polling Required
You must poll `GET /api/v1/jobs/{job_id}` to get the final result.

## 📋 API Changes Reference

### All Generation Endpoints Now Async

| Endpoint | Old Response | New Response |
|----------|-------------|--------------|
| `POST /generate?chat=true` | 200 OK + image_url | 202 Accepted + job_id |
| `POST /generate?flatlay=true` | 200 OK + image_url | 202 Accepted + job_id |
| `POST /generate?mdoli=true` | 200 OK + image_url | 202 Accepted + job_id |
| `POST /generate?onmodel=true` | 200 OK + image_url | 202 Accepted + job_id |
| `POST /generate?background=true` | 200 OK + image_url | 202 Accepted + job_id |
| `POST /generate` | 200 OK + image_url | 202 Accepted + job_id |

### New Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/jobs/{id}` | GET | Get job status and result |
| `/api/v1/jobs` | GET | List all user jobs (paginated) |
| `/api/v1/jobs/{id}` | DELETE | Cancel a pending job |

## 🚀 Implementation Guide

### Step 1: Create API Service Functions

```javascript
// src/services/api.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

// Helper to get auth token
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

/**
 * Create a new generation job
 * @param {string} type - Generation type: 'chat', 'flatlay', 'onmodel', etc.
 * @param {object} payload - Request payload
 * @returns {Promise<{job_id: number, status: string}>}
 */
export const createGenerationJob = async (type, payload) => {
  const queryParam = type !== 'legacy' ? `?${type}=true` : '';
  
  const response = await fetch(`${API_BASE_URL}/generate${queryParam}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create job');
  }

  return response.json(); // { success: true, job_id: 123, status: "pending" }
};

/**
 * Get job status and result
 * @param {number} jobId - Job ID
 * @returns {Promise<object>} Job details with status and result
 */
export const getJobStatus = async (jobId) => {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch job status');
  }

  return response.json();
};

/**
 * Poll job status until completed or failed
 * @param {number} jobId - Job ID
 * @param {object} options - Polling options
 * @returns {Promise<object>} Final job result
 */
export const pollJobStatus = async (
  jobId,
  {
    interval = 2000,        // Poll every 2 seconds
    maxAttempts = 150,      // Max 5 minutes (150 * 2s)
    onProgress = null,      // Callback for status updates
  } = {}
) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const job = await getJobStatus(jobId);

    // Call progress callback if provided
    if (onProgress) {
      onProgress(job);
    }

    // Job completed successfully
    if (job.status === 'completed') {
      return job.result; // { image_url, generated_at, message }
    }

    // Job failed
    if (job.status === 'failed') {
      throw new Error(job.error || 'Job failed');
    }

    // Still processing, wait before next poll
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error('Job polling timed out after 5 minutes');
};

/**
 * List all jobs for the current user
 * @param {object} params - Pagination params
 * @returns {Promise<{jobs: Array, metadata: object}>}
 */
export const listJobs = async ({ page = 1, pageSize = 20 } = {}) => {
  const response = await fetch(
    `${API_BASE_URL}/jobs?page=${page}&page_size=${pageSize}`,
    { headers: getAuthHeaders() }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch jobs');
  }

  return response.json(); // { jobs: [...], metadata: {...} }
};

/**
 * Cancel a pending job
 * @param {number} jobId - Job ID
 * @returns {Promise<void>}
 */
export const cancelJob = async (jobId) => {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to cancel job');
  }

  return response.json();
};
```

### Step 2: Create React Hook for Job Management

```javascript
// src/hooks/useImageGeneration.js

import { useState, useCallback } from 'react';
import { createGenerationJob, pollJobStatus } from '../services/api';

export const useImageGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Generate an image
   * @param {string} type - Generation type
   * @param {object} payload - Request payload
   * @returns {Promise<string>} Image URL
   */
  const generate = useCallback(async (type, payload) => {
    setLoading(true);
    setError(null);
    setProgress({ status: 'creating', message: 'Creating job...' });

    try {
      // Step 1: Create the job
      const { job_id } = await createGenerationJob(type, payload);
      
      setProgress({ 
        status: 'pending', 
        message: 'Job created, waiting for processing...',
        jobId: job_id 
      });

      // Step 2: Poll for completion
      const result = await pollJobStatus(job_id, {
        onProgress: (job) => {
          setProgress({
            status: job.status,
            message: getStatusMessage(job.status),
            jobId: job_id,
            attempts: job.attempts,
          });
        },
      });

      setProgress({ 
        status: 'completed', 
        message: 'Generation complete!',
        jobId: job_id 
      });
      
      return result.image_url;

    } catch (err) {
      setError(err.message);
      setProgress({ status: 'failed', message: err.message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setProgress(null);
    setError(null);
  }, []);

  return { generate, loading, progress, error, reset };
};

// Helper to get user-friendly status messages
const getStatusMessage = (status) => {
  const messages = {
    pending: 'Waiting in queue...',
    processing: 'Generating your image... (this may take 2-3 minutes)',
    completed: 'Generation complete!',
    failed: 'Generation failed',
  };
  return messages[status] || 'Processing...';
};
```

### Step 3: Use in Components

#### Example 1: Chat Image Generation

```jsx
// src/components/ChatImageGenerator.jsx

import React, { useState } from 'react';
import { useImageGeneration } from '../hooks/useImageGeneration';

export const ChatImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const { generate, loading, progress, error, reset } = useImageGeneration();

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    try {
      const url = await generate('chat', { 
        prompt,
        images: [] // Optional reference images
      });
      setImageUrl(url);
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  return (
    <div className="chat-generator">
      <h2>Generate Image from Text</h2>
      
      <form onSubmit={handleGenerate}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          rows={4}
          disabled={loading}
        />
        
        <button type="submit" disabled={loading || !prompt.trim()}>
          {loading ? 'Generating...' : 'Generate Image'}
        </button>
      </form>

      {/* Progress Indicator */}
      {loading && progress && (
        <div className="progress-container">
          <div className="spinner" />
          <p>{progress.message}</p>
          {progress.jobId && (
            <small>Job ID: {progress.jobId}</small>
          )}
          {progress.status === 'processing' && (
            <div className="estimated-time">
              Estimated time: 2-3 minutes
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
          <button onClick={reset}>Try Again</button>
        </div>
      )}

      {/* Result Display */}
      {imageUrl && !loading && (
        <div className="result-container">
          <h3>Generated Image</h3>
          <img src={imageUrl} alt="Generated" />
          <a href={imageUrl} download target="_blank" rel="noopener noreferrer">
            Download Image
          </a>
        </div>
      )}
    </div>
  );
};
```

#### Example 2: Flatlay Generation

```jsx
// src/components/FlatlayGenerator.jsx

import React, { useState } from 'react';
import { useImageGeneration } from '../hooks/useImageGeneration';

export const FlatlayGenerator = () => {
  const [modelId, setModelId] = useState('1');
  const [backgroundId, setBackgroundId] = useState('1');
  const [products, setProducts] = useState([]);
  const { generate, loading, progress, error } = useImageGeneration();

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    try {
      const url = await generate('flatlay', {
        modelId,
        backgroundId,
        products,
      });
      
      // Handle success
      console.log('Generated:', url);
    } catch (err) {
      console.error('Failed:', err);
    }
  };

  return (
    <div className="flatlay-generator">
      <h2>Flatlay Generation</h2>
      
      <form onSubmit={handleGenerate}>
        {/* Model selection */}
        <select value={modelId} onChange={(e) => setModelId(e.target.value)}>
          <option value="1">Model 1</option>
          <option value="2">Model 2</option>
        </select>

        {/* Background selection */}
        <select value={backgroundId} onChange={(e) => setBackgroundId(e.target.value)}>
          <option value="1">Background 1</option>
          <option value="2">Background 2</option>
        </select>

        {/* Product upload (simplified) */}
        {/* Add your product upload UI here */}

        <button type="submit" disabled={loading || products.length === 0}>
          Generate Flatlay
        </button>
      </form>

      {/* Progress indicator */}
      {loading && <ProgressIndicator progress={progress} />}

      {/* Error handling */}
      {error && <ErrorDisplay error={error} />}
    </div>
  );
};
```

#### Example 3: Job History Component

```jsx
// src/components/JobHistory.jsx

import React, { useEffect, useState } from 'react';
import { listJobs, cancelJob } from '../services/api';

export const JobHistory = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadJobs();
  }, [page]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const { jobs: jobList, metadata } = await listJobs({ page, pageSize: 10 });
      setJobs(jobList);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (jobId) => {
    try {
      await cancelJob(jobId);
      loadJobs(); // Reload jobs
    } catch (err) {
      alert('Failed to cancel job: ' + err.message);
    }
  };

  if (loading) return <div>Loading jobs...</div>;

  return (
    <div className="job-history">
      <h2>Generation History</h2>
      
      <div className="jobs-list">
        {jobs.map((job) => (
          <div key={job.job_id} className={`job-card status-${job.status}`}>
            <div className="job-header">
              <span className="job-type">{job.job_type}</span>
              <span className={`status-badge status-${job.status}`}>
                {job.status}
              </span>
            </div>

            <div className="job-details">
              <small>Job ID: {job.job_id}</small>
              <small>Created: {new Date(job.created_at).toLocaleString()}</small>
              {job.completed_at && (
                <small>Completed: {new Date(job.completed_at).toLocaleString()}</small>
              )}
            </div>

            {/* Show image if completed */}
            {job.status === 'completed' && job.result && (
              <div className="job-result">
                <img src={job.result.image_url} alt="Generated" />
                <a href={job.result.image_url} download>Download</a>
              </div>
            )}

            {/* Show error if failed */}
            {job.status === 'failed' && job.error && (
              <div className="job-error">
                <strong>Error:</strong> {job.error}
              </div>
            )}

            {/* Show cancel button for pending jobs */}
            {job.status === 'pending' && (
              <button onClick={() => handleCancel(job.job_id)}>
                Cancel Job
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage(p => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};
```

### Step 4: Add Progress Indicators

```jsx
// src/components/ProgressIndicator.jsx

import React from 'react';
import './ProgressIndicator.css';

export const ProgressIndicator = ({ progress }) => {
  if (!progress) return null;

  const getProgressPercentage = () => {
    const percentages = {
      creating: 10,
      pending: 20,
      processing: 60,
      completed: 100,
      failed: 0,
    };
    return percentages[progress.status] || 0;
  };

  return (
    <div className="progress-indicator">
      <div className="progress-bar-container">
        <div 
          className="progress-bar" 
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>
      
      <div className="progress-content">
        <div className="spinner" />
        <div className="progress-text">
          <strong>{progress.message}</strong>
          {progress.jobId && (
            <small>Job ID: {progress.jobId}</small>
          )}
          {progress.status === 'processing' && (
            <small>⏱️ This usually takes 2-3 minutes</small>
          )}
        </div>
      </div>
    </div>
  );
};
```

```css
/* src/components/ProgressIndicator.css */

.progress-indicator {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  margin: 20px 0;
}

.progress-bar-container {
  width: 100%;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #81C784);
  transition: width 0.3s ease;
}

.progress-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e0e0e0;
  border-top-color: #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.progress-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-text strong {
  font-size: 16px;
  color: #333;
}

.progress-text small {
  font-size: 12px;
  color: #666;
}
```

## 🎨 UX Best Practices

### 1. Show Clear Progress States

```jsx
const statusConfig = {
  pending: {
    icon: '⏳',
    color: '#FF9800',
    message: 'Waiting in queue...',
  },
  processing: {
    icon: '⚙️',
    color: '#2196F3',
    message: 'Generating your image...',
  },
  completed: {
    icon: '✅',
    color: '#4CAF50',
    message: 'Complete!',
  },
  failed: {
    icon: '❌',
    color: '#F44336',
    message: 'Failed',
  },
};
```

### 2. Prevent Multiple Submissions

```jsx
const [isGenerating, setIsGenerating] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  if (isGenerating) return; // Prevent double submission
  
  setIsGenerating(true);
  try {
    await generate('chat', payload);
  } finally {
    setIsGenerating(false);
  }
};
```

### 3. Allow Users to Leave and Return

```jsx
// Store job_id in localStorage for later retrieval
const handleGenerate = async () => {
  const { job_id } = await createGenerationJob('chat', payload);
  
  // Store for recovery
  localStorage.setItem('current_job_id', job_id);
  localStorage.setItem('current_job_started_at', Date.now());
  
  // Poll for result
  const result = await pollJobStatus(job_id);
  
  // Clear storage on completion
  localStorage.removeItem('current_job_id');
  localStorage.removeItem('current_job_started_at');
};

// On component mount, check for ongoing job
useEffect(() => {
  const jobId = localStorage.getItem('current_job_id');
  const startedAt = localStorage.getItem('current_job_started_at');
  
  if (jobId && startedAt) {
    const elapsed = Date.now() - parseInt(startedAt);
    if (elapsed < 10 * 60 * 1000) { // Less than 10 minutes old
      resumePolling(jobId);
    } else {
      // Too old, clear it
      localStorage.removeItem('current_job_id');
      localStorage.removeItem('current_job_started_at');
    }
  }
}, []);
```

### 4. Handle Errors Gracefully

```jsx
const handleError = (error) => {
  // Different error handling based on error type
  if (error.message.includes('timeout')) {
    return 'Generation took too long. Please try again with a simpler request.';
  }
  if (error.message.includes('rate limit')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  if (error.message.includes('authentication')) {
    return 'Session expired. Please log in again.';
  }
  return error.message || 'An unexpected error occurred';
};
```

## 🔧 Advanced Patterns

### Exponential Backoff for Polling

```javascript
export const pollJobStatusWithBackoff = async (
  jobId,
  { maxAttempts = 150, onProgress = null } = {}
) => {
  let interval = 1000; // Start with 1 second
  const maxInterval = 5000; // Max 5 seconds
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const job = await getJobStatus(jobId);
    
    if (onProgress) onProgress(job);
    
    if (job.status === 'completed') return job.result;
    if (job.status === 'failed') throw new Error(job.error);
    
    // Exponential backoff: increase interval gradually
    await new Promise(resolve => setTimeout(resolve, interval));
    interval = Math.min(interval * 1.2, maxInterval);
  }
  
  throw new Error('Polling timed out');
};
```

### Batch Job Management

```javascript
export const useBatchGeneration = () => {
  const [jobs, setJobs] = useState([]);
  
  const addJob = useCallback(async (type, payload) => {
    const { job_id } = await createGenerationJob(type, payload);
    
    setJobs(prev => [...prev, {
      id: job_id,
      type,
      status: 'pending',
      payload,
    }]);
    
    // Start polling in background
    pollJobStatus(job_id, {
      onProgress: (job) => {
        setJobs(prev => prev.map(j => 
          j.id === job_id ? { ...j, status: job.status } : j
        ));
      },
    }).then(result => {
      setJobs(prev => prev.map(j => 
        j.id === job_id ? { ...j, status: 'completed', result } : j
      ));
    }).catch(error => {
      setJobs(prev => prev.map(j => 
        j.id === job_id ? { ...j, status: 'failed', error: error.message } : j
      ));
    });
    
    return job_id;
  }, []);
  
  return { jobs, addJob };
};
```

## 📱 Mobile Considerations

### Handle App Backgrounding

```javascript
import { useEffect } from 'react';

export const useBackgroundPolling = (jobId, onComplete) => {
  useEffect(() => {
    if (!jobId) return;
    
    let polling = true;
    
    const poll = async () => {
      while (polling) {
        try {
          const job = await getJobStatus(jobId);
          
          if (job.status === 'completed') {
            onComplete(job.result);
            polling = false;
          } else if (job.status === 'failed') {
            onComplete(null, new Error(job.error));
            polling = false;
          }
          
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (err) {
          console.error('Polling error:', err);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    };
    
    poll();
    
    return () => {
      polling = false;
    };
  }, [jobId, onComplete]);
};
```

## 🐛 Debugging Tips

### Enable Debug Logging

```javascript
const DEBUG = process.env.NODE_ENV === 'development';

export const pollJobStatus = async (jobId, options = {}) => {
  if (DEBUG) console.log('[POLL] Starting for job', jobId);
  
  for (let attempt = 0; attempt < options.maxAttempts; attempt++) {
    const job = await getJobStatus(jobId);
    
    if (DEBUG) {
      console.log(`[POLL] Attempt ${attempt + 1}: ${job.status}`, job);
    }
    
    // ... rest of polling logic
  }
};
```

### Monitor Network Requests

```javascript
// Add request/response interceptor for debugging
const fetchWithLogging = async (url, options) => {
  console.log('→ Request:', url, options);
  const response = await fetch(url, options);
  console.log('← Response:', response.status, await response.clone().json());
  return response;
};
```

## ✅ Testing Checklist

- [ ] Job creation returns job_id immediately
- [ ] Polling updates UI with status changes
- [ ] Completed jobs show image correctly
- [ ] Failed jobs show error message
- [ ] Can cancel pending jobs
- [ ] Job history loads and displays correctly
- [ ] Multiple concurrent jobs work properly
- [ ] Error handling works for network failures
- [ ] Loading states prevent duplicate submissions
- [ ] Works correctly after page reload (recovery)

## 📚 TypeScript Support

```typescript
// src/types/job.ts

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Job {
  job_id: number;
  status: JobStatus;
  job_type: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  attempts: number;
  result?: {
    image_url: string;
    generated_at: string;
    message: string;
  };
  error?: string;
}

export interface CreateJobResponse {
  success: boolean;
  job_id: number;
  status: 'pending';
  message: string;
}

export interface PollOptions {
  interval?: number;
  maxAttempts?: number;
  onProgress?: (job: Job) => void;
}
```

## 🎉 Summary

**Key Changes:**
1. All generation endpoints return `202 Accepted` with `job_id`
2. Must poll `GET /jobs/{id}` to get results
3. Expected processing time: 2-3 minutes

**Implementation Steps:**
1. ✅ Update API service functions to handle async flow
2. ✅ Create React hook for job management
3. ✅ Add polling logic with progress indicators
4. ✅ Update UI components to show loading states
5. ✅ Add error handling for failed jobs
6. ✅ Implement job history view

**Best Practices:**
- Poll every 2 seconds with max 5 minutes timeout
- Show clear progress indicators
- Allow users to leave and return
- Store job_id for recovery
- Handle errors gracefully

**Questions?** Check the main documentation or ask your backend team!

