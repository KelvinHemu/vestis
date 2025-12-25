# Model Self-Registration Feature

## Overview

Models can register on Vestis to have their profiles used for AI-generated fashion images. The system includes legal compliance (age verification, consent), admin approval workflow, and re-review triggers.

## Registration Flow

```
1. Register → 2. Upload Photos → 3. Submit → 4. Admin Review → 5. Approved/Rejected
   (draft)      (min 2 photos)    (pending)                        ↓
                                                              Re-review ←── Update sensitive fields
```

## Status Lifecycle

| Status | Description | Visible to Public |
|--------|-------------|-------------------|
| `draft` | Profile created, awaiting photo uploads | No |
| `pending_review` | Submitted for admin review | No |
| `approved` | Approved and live | Yes |
| `rejected` | Rejected with reason | No |

## API Endpoints

### Step 1: Register as Model
```
POST /api/v1/models/register
```
```json
{
  "name": "Jane Doe",
  "gender": "female",
  "date_of_birth": "1995-06-15",
  "country": "Tanzania",
  "consent_age_confirmation": true,
  "consent_ai_usage": true,
  "consent_brand_usage": true
}
```
- **Required**: name, gender, date_of_birth, country, all 3 consents
- **Age**: Must be 18+ (calculated from DOB)
- **Status**: Set to `draft`

### Step 2: Upload Photos
```
POST /api/v1/models/my-profile/images
```
```json
{
  "image": "base64_encoded_image",
  "position": 1
}
```
- **Minimum**: 2 photos required for submission
- **Maximum**: 10 photos allowed

### Step 3: Submit for Review
```
POST /api/v1/models/my-profile/submit
```
- Validates minimum 2 photos uploaded
- Changes status from `draft` → `pending_review`

### Step 4: Update Profile
```
PUT /api/v1/models/my-profile
```

**Allowed fields** (no re-review):
- `bio`, `instagram_handle`, `phone_number`, `country_code`

**Restricted fields** (triggers re-review for approved models):
- `date_of_birth`, `height_cm`, `waist_cm`, `hips_cm`, `bust_cm`, `chest_cm`, `shoulder_width_cm`, `inseam_cm`, `neck_cm`, `shoe_size_eu`, `clothing_size`

**Locked fields** (contact support to change):
- `name`, `gender`, `country`

### Get My Profile
```
GET /api/v1/models/my-profile
```

## Admin Endpoints

### List Models with Filters
```
GET /api/v1/admin/models?status=pending_review&gender=female&page=1&page_size=20
```
**Filters**: `status`, `gender`, `country`, `from_date`, `to_date`

### Get Model with Audit Log
```
GET /api/v1/admin/models/{id}
```
Returns model profile + complete audit history.

### Approve Model
```
POST /api/v1/admin/models/{id}/approve
```

### Reject Model
```
POST /api/v1/admin/models/{id}/reject
```
```json
{
  "reason": "Photos do not meet quality standards"
}
```

## Re-Review Triggers

When an **approved** model updates:
1. **Sensitive profile fields** (measurements, DOB) → status resets to `pending_review`
2. **Uploads new photo** → status resets to `pending_review`

Model receives email notification and profile is hidden until re-approved.

## Database Tables

### models (enhanced fields)
- `date_of_birth` - Date (required, must be 18+)
- `registration_status` - Enum: draft, pending_review, approved, rejected
- `consent_ai_usage`, `consent_brand_usage`, `consent_age_confirmation` - Boolean
- `consent_version`, `consent_timestamp` - Audit trail

### model_review_audit
Tracks all admin actions:
- `model_id`, `admin_id`, `action` (approved/rejected)
- `reason`, `previous_status`, `new_status`, `created_at`

## Email Notifications

| Event | Email Sent |
|-------|------------|
| Profile created (draft) | ✓ Draft confirmation |
| Submitted for review | ✓ Submission confirmation |
| Approved | ✓ Approval notification |
| Rejected | ✓ Rejection with reason |
| Re-review triggered | ✓ Re-review notification |

## Consent Requirements

All three consents are **mandatory** during registration:
1. **Age Confirmation**: "I confirm I am 18 years or older"
2. **AI Usage**: "I consent to my images being used for AI generation"
3. **Brand Usage**: "I consent to my images being used by brands"

Consent version (currently "1.0") and timestamp are recorded for legal compliance.
