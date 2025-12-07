# Model Self-Registration Feature - Frontend Integration Guide

## Overview
Users can now register themselves as models on Vestis. This feature allows regular users to create model profiles with detailed measurements and photos. Admins review and approve/reject these registrations before models appear in the public model list.

---

## New User Flows

### Flow 1: Model Registration (User Side)
```
User Dashboard → "Become a Model" Button → Registration Form → Upload Photos → Wait for Approval
```

### Flow 2: Admin Approval (Admin Side)
```
Admin Dashboard → "Pending Models" → Review Profile → Approve/Reject → Email Sent Automatically
```

---

## API Endpoints

### 1. Register as Model
**Endpoint:** `POST /api/v1/models/register`  
**Auth:** Required (Bearer token)  
**Purpose:** User registers themselves as a model

**Request Body:**
```json
{
  "name": "John Doe",
  "gender": "male",           // Required: "male", "female", "non-binary", "other"
  "age_min": 25,              // Required: 18-120
  "age_max": 30,              // Required: 18-120
  
  // Optional contact info
  "phone_number": "+1234567890",
  "country_code": "+1",
  "country": "United States",
  "instagram_handle": "@johndoe",
  
  // Optional physical attributes
  "eye_color": "Brown",
  "hair_color": "Black",
  "clothing_size": "M-L",     // Options: S, S-M, S-L, M-L, L-XL, L-XXL, XXL
  
  // Optional measurements (all in cm)
  "height_cm": 180,           // 140-250
  "waist_cm": 32.0,           // 50-200
  "hips_cm": 38.0,            // 50-200
  "bust_cm": 36.0,            // 50-200 (for female/non-binary)
  "chest_cm": 40.0,           // 50-200 (for male)
  "shoulder_width_cm": 45.0,  // 30-80 (for male)
  "inseam_cm": 82.0,          // 50-120 (for male)
  "neck_cm": 38.0,            // 20-60 (for male)
  "shoe_size_eu": 42.0,       // 20-60
  
  // Optional bio
  "bio": "Professional model with 5 years experience..."  // Max 1000 chars
}
```

**Success Response (201):**
```json
{
  "model": {
    "id": 123,
    "name": "John Doe",
    "gender": "male",
    "age_range": {
      "min": 25,
      "max": 30
    },
    "registration_status": "pending",
    "is_verified": false,
    "created_at": "2025-12-05T10:30:00Z",
    ...
  }
}
```

**Error Responses:**
- `400`: Invalid input data
- `401`: Unauthorized (no/invalid token)
- `409`: User already has a model profile
- `422`: Validation errors (see below)

**Validation Errors Example (422):**
```json
{
  "error": {
    "name": "must be provided",
    "age_range": "minimum age must be at least 18",
    "phone_number": "must be a valid phone number",
    "height_cm": "must be between 140 and 250 cm"
  }
}
```

---

### 2. Get My Model Profile
**Endpoint:** `GET /api/v1/models/my-profile`  
**Auth:** Required  
**Purpose:** View current user's model profile

**Success Response (200):**
```json
{
  "model": {
    "id": 123,
    "name": "John Doe",
    "gender": "male",
    "age_range": {"min": 25, "max": 30},
    "registration_status": "pending",  // "pending", "approved", "rejected"
    "is_verified": false,
    "rejection_reason": null,          // Only if rejected
    "images": [
      {
        "id": 456,
        "url": "https://res.cloudinary.com/...",
        "position": 1,
        "alt_text": "Front view",
        "created_at": "2025-12-05T10:35:00Z"
      }
    ],
    "height_cm": 180,
    "bio": "...",
    ...
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: User doesn't have a model profile

---

### 3. Update My Model Profile
**Endpoint:** `PUT /api/v1/models/my-profile`  
**Auth:** Required  
**Purpose:** Update existing model profile

**Request Body:** (All fields optional - only send what needs to change)
```json
{
  "name": "John Smith",
  "height_cm": 182,
  "bio": "Updated bio...",
  ...
}
```

**Success Response (200):** Returns updated model object

**Error Responses:**
- `401`: Unauthorized
- `403`: Cannot update rejected profile (must re-register)
- `404`: Model profile not found
- `409`: Edit conflict (someone else modified simultaneously)
- `422`: Validation errors

**Important:** Cannot update profiles with `registration_status: "rejected"`. User must register again.

---

### 4. Upload Model Image
**Endpoint:** `POST /api/v1/models/my-profile/images`  
**Auth:** Required  
**Purpose:** Upload profile photos (max 10 per model)

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...",  // Required
  "position": 1,           // Optional (1-10, auto-increments if not provided)
  "alt_text": "Front view" // Optional
}
```

**How to Convert Image to Base64 (JavaScript):**
```javascript
function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Usage
const base64Image = await convertImageToBase64(selectedFile);
```

**Success Response (201):**
```json
{
  "image": {
    "id": 456,
    "model_id": 123,
    "url": "https://res.cloudinary.com/vestis/image/upload/v1234567890/model_123_pos_1.jpg",
    "position": 1,
    "alt_text": "Front view",
    "created_at": "2025-12-05T10:40:00Z"
  }
}
```

**Error Responses:**
- `400`: Invalid image data
- `401`: Unauthorized
- `404`: Model profile not found
- `409`: Maximum of 10 images reached

---

### 5. List Pending Models (Admin Only)
**Endpoint:** `GET /api/v1/admin/models/pending`  
**Auth:** Required (Admin role)  
**Purpose:** Admin views all pending model registrations

**Success Response (200):**
```json
{
  "models": [
    {
      "id": 123,
      "user_id": 456,
      "name": "John Doe",
      "gender": "male",
      "registration_status": "pending",
      "created_at": "2025-12-05T10:30:00Z",
      "images": [...],
      ...
    }
  ]
}
```

**Error Responses:**
- `401`: Unauthorized
- `403`: Admin access required

---

### 6. Approve Model (Admin Only)
**Endpoint:** `PUT /api/v1/admin/models/{id}/approve`  
**Auth:** Required (Admin role)  
**Purpose:** Approve a pending model registration

**Success Response (200):**
```json
{
  "message": "model approved successfully"
}
```

**Side Effects:**
- Model `registration_status` → `"approved"`
- Model `is_verified` → `true`
- Model appears in public model list (`GET /api/v1/models`)
- Approval email sent to model automatically

**Error Responses:**
- `400`: Invalid model ID
- `401`: Unauthorized
- `403`: Admin access required
- `404`: Model not found or not pending

---

### 7. Reject Model (Admin Only)
**Endpoint:** `PUT /api/v1/admin/models/{id}/reject`  
**Auth:** Required (Admin role)  
**Purpose:** Reject a pending model registration with reason

**Request Body:**
```json
{
  "reason": "Photos do not meet quality standards. Please upload high-resolution, well-lit images showing clear facial features."
}
```

**Success Response (200):**
```json
{
  "message": "model rejected successfully"
}
```

**Side Effects:**
- Model `registration_status` → `"rejected"`
- `rejection_reason` field populated
- Rejection email sent to model automatically
- Model cannot update profile (must re-register)

**Error Responses:**
- `400`: Invalid model ID or missing reason
- `401`: Unauthorized
- `403`: Admin access required
- `404`: Model not found
- `422`: Validation errors (reason required, max 500 chars)

---

### 8. List All Models (Updated)
**Endpoint:** `GET /api/v1/models`  
**Auth:** Optional  
**Purpose:** Get all approved models (public endpoint)

**Behavior Changed:**
- Now only returns models with `registration_status: "approved"`
- Admin-created models (no `user_id`) still appear
- Pending/rejected models are hidden

**Response:** Same as before
```json
{
  "models": [
    {
      "id": 1,
      "name": "Jane Smith",
      "gender": "female",
      "status": "active",
      "images": [...],
      ...
    }
  ]
}
```

---

## UI/UX Implementation Guide

### User Dashboard - New "Become a Model" Section

**1. Check if user is already a model:**
```javascript
async function checkModelProfile(token) {
  const response = await fetch('/api/v1/models/my-profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (response.status === 404) {
    return null; // Not a model yet
  }
  return response.json();
}
```

**2. Show appropriate UI:**
- **No profile:** Show "Become a Model" button → Registration form
- **Pending:** Show "Registration Under Review" banner with profile preview
- **Approved:** Show "Model Profile Active" with edit button
- **Rejected:** Show rejection reason + "Register Again" button

---

### Registration Form Design

**Required Fields:**
```html
<form>
  <input name="name" required />
  <select name="gender" required>
    <option value="male">Male</option>
    <option value="female">Female</option>
    <option value="non-binary">Non-Binary</option>
    <option value="other">Other</option>
  </select>
  <input name="age_min" type="number" min="18" max="120" required />
  <input name="age_max" type="number" min="18" max="120" required />
</form>
```

**Suggested Form Sections:**
1. **Basic Info** (required): Name, Gender, Age Range
2. **Contact** (optional): Phone, Country, Instagram
3. **Physical Attributes** (optional): Eye/Hair Color, Clothing Size
4. **Measurements** (optional): Height, Waist, Hips, etc.
5. **About** (optional): Bio (textarea, max 1000 chars)

**Dynamic Fields Based on Gender:**
- **Female/Non-Binary:** Show Bust field
- **Male:** Show Chest, Shoulder Width, Inseam, Neck fields

---

### Image Upload Component

**Features Needed:**
- Drag & drop support
- Multiple file selection
- Preview before upload
- Progress indicator
- Max 10 images limit
- Position reordering (drag to reorder)

**Example Implementation:**
```javascript
async function uploadModelImage(file, position, token) {
  // Convert to base64
  const base64 = await convertImageToBase64(file);
  
  // Upload
  const response = await fetch('/api/v1/models/my-profile/images', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      image: base64,
      position: position,
      alt_text: `Model photo ${position}`
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }
  
  return response.json();
}

// Usage
try {
  const result = await uploadModelImage(selectedFile, 1, userToken);
  console.log('Uploaded:', result.image.url);
} catch (error) {
  alert(error.message);
}
```

**UI States:**
```javascript
const [images, setImages] = useState([]);
const [uploading, setUploading] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);

const handleUpload = async (files) => {
  if (images.length + files.length > 10) {
    alert('Maximum 10 images allowed');
    return;
  }
  
  setUploading(true);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const position = images.length + i + 1;
    
    try {
      const result = await uploadModelImage(file, position, token);
      setImages(prev => [...prev, result.image]);
      setUploadProgress((i + 1) / files.length * 100);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }
  setUploading(false);
};
```

---

### Admin Dashboard - Model Review Interface

**Components Needed:**

**1. Pending Models List:**
```javascript
async function fetchPendingModels(adminToken) {
  const response = await fetch('/api/v1/admin/models/pending', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  return response.json();
}
```

**2. Model Review Card:**
Display:
- Model name, gender, age range
- All uploaded photos (gallery/carousel)
- All measurements in a table
- Bio
- Registration date
- Action buttons: Approve / Reject

**3. Approval Flow:**
```javascript
async function approveModel(modelId, adminToken) {
  const response = await fetch(`/api/v1/admin/models/${modelId}/approve`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  
  if (response.ok) {
    alert('Model approved! Email sent automatically.');
    // Refresh list
  }
}
```

**4. Rejection Flow:**
```javascript
async function rejectModel(modelId, reason, adminToken) {
  const response = await fetch(`/api/v1/admin/models/${modelId}/reject`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reason })
  });
  
  if (response.ok) {
    alert('Model rejected. Email sent with feedback.');
    // Refresh list
  }
}
```

**Rejection Reason Textarea:**
- Required field
- Max 500 characters
- Helpful prompts: "Be specific about what needs improvement"
- Preview how it will appear in email

---

## Status Badge Component

Reusable component to show registration status:

```jsx
function RegistrationStatusBadge({ status }) {
  const styles = {
    pending: { bg: 'yellow', text: 'Pending Review' },
    approved: { bg: 'green', text: 'Approved ✓' },
    rejected: { bg: 'red', text: 'Rejected' }
  };
  
  const style = styles[status];
  return (
    <span className={`badge badge-${style.bg}`}>
      {style.text}
    </span>
  );
}
```

---

## Email Notifications (FYI)

Users receive emails automatically (no frontend action needed):

1. **On Registration:** "Profile Submitted for Review"
2. **On Approval:** "Congratulations! Profile Approved"
3. **On Rejection:** Reason included + instructions to resubmit

Email sender: Will be configured via `RESEND_FROM` env variable

---

## Validation Rules Summary

### Required Fields:
- `name` (max 200 chars)
- `gender` (enum: male, female, non-binary, other)
- `age_min` (18-120)
- `age_max` (18-120, must be >= age_min)

### Optional Measurements:
| Field | Min | Max | Unit |
|-------|-----|-----|------|
| height_cm | 140 | 250 | cm |
| waist_cm | 50 | 200 | cm |
| hips_cm | 50 | 200 | cm |
| bust_cm | 50 | 200 | cm |
| chest_cm | 50 | 200 | cm |
| shoulder_width_cm | 30 | 80 | cm |
| inseam_cm | 50 | 120 | cm |
| neck_cm | 20 | 60 | cm |
| shoe_size_eu | 20 | 60 | EU size |

### Text Fields:
- `phone_number`: E.164 format (e.g., +1234567890)
- `instagram_handle`: Valid Instagram username format
- `bio`: Max 1000 characters
- `clothing_size`: Enum (S, S-M, S-L, M-L, L-XL, L-XXL, XXL)

---

## Error Handling Best Practices

```javascript
async function registerAsModel(data, token) {
  try {
    const response = await fetch('/api/v1/models/register', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      // Handle specific errors
      switch (response.status) {
        case 409:
          alert('You already have a model profile!');
          break;
        case 422:
          // Show validation errors next to form fields
          displayValidationErrors(result.error);
          break;
        default:
          alert('Registration failed. Please try again.');
      }
      return null;
    }
    
    return result.model;
  } catch (error) {
    console.error('Network error:', error);
    alert('Connection error. Please check your internet.');
    return null;
  }
}
```

---

## Testing Checklist

### User Registration:
- [ ] Form validates required fields
- [ ] Optional fields work correctly
- [ ] Phone number validation
- [ ] Instagram handle validation
- [ ] Age range validation (min <= max)
- [ ] Measurement ranges enforced
- [ ] Bio character limit (1000)
- [ ] Duplicate registration prevented (409 error)

### Image Upload:
- [ ] File selection works
- [ ] Base64 conversion successful
- [ ] Upload shows progress
- [ ] Max 10 images enforced
- [ ] Images display after upload
- [ ] Position ordering works

### Admin Functions:
- [ ] Admin can access admin endpoints
- [ ] Regular users cannot access admin endpoints
- [ ] Pending list updates after actions
- [ ] Approve button works
- [ ] Reject requires reason
- [ ] Rejection reason max 500 chars

### Edge Cases:
- [ ] Expired token handled
- [ ] Network errors handled gracefully
- [ ] Concurrent edits (409 conflict)
- [ ] Rejected profile cannot be edited
- [ ] Images over size limit handled

---

## Design Recommendations

### User Experience:
1. **Progress Indicator:** Show steps (Profile → Photos → Review)
2. **Auto-save:** Save draft periodically
3. **Photo Guidelines:** Show example photos with tips
4. **Measurements Help:** Tooltips explaining how to measure
5. **Status Notifications:** Real-time updates when approved

### Admin Experience:
1. **Batch Actions:** "Approve All" / "Reject All" options
2. **Filter/Sort:** By date, gender, status
3. **Quick View:** Modal with full details
4. **Rejection Templates:** Common rejection reasons
5. **Statistics:** Total pending, approved rate, etc.

---

## Questions or Issues?

Contact backend team for:
- API errors or unexpected behavior
- Missing validation rules
- Performance issues with image uploads
- Email delivery problems
- Admin access setup

**Backend Documentation:**
- Full API docs: `/swagger/` endpoint
- Model registration details: `MODEL_REGISTRATION_README.md`
- Setup guide: `SETUP_INSTRUCTIONS.md`
