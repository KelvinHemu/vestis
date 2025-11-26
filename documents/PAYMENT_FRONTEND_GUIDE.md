# Payment Feature - Frontend Developer Guide

## Overview
This guide covers the ZenoPay mobile money payment integration for purchasing credits in the Vestis application. The payment system supports Tanzanian mobile money providers (M-Pesa, Tigo, Airtel).

---

## Prerequisites
- User must be authenticated (valid JWT token required) except for the `/api/v1/credits/pricing` endpoint which is **public**
- Base API URL: `https://your-api-domain.com` (replace with actual API URL)
- All endpoints require `Authorization: Bearer {token}` header

---

## Credit Packages Available

### GET /api/v1/credits/pricing

Fetch available credit packages and pricing information.

**⚠️ Note:** This endpoint is **public** and does **not** require authentication.

**Request:**
```javascript
const response = await fetch('https://your-api.com/api/v1/credits/pricing');
const data = await response.json();
```

**Response (200 OK):**
```json
{
  "packages": [
    {
      "id": "starter",
      "name": "Starter",
      "credits": 50,
      "price_usd": 0.2,
      "price_tzs": 500,
      "per_credit_usd": 0.20,
      "savings": 0,
      "recommended": false
    },
    {
      "id": "basic",
      "name": "Basic",
      "credits": 150,
      "price_usd": 24.99,
      "price_tzs": 62000,
      "per_credit_usd": 0.17,
      "savings": 15,
      "recommended": true
    },
    {
      "id": "pro",
      "name": "Pro",
      "credits": 500,
      "price_usd": 74.99,
      "price_tzs": 187000,
      "per_credit_usd": 0.15,
      "savings": 25,
      "recommended": false
    },
    {
      "id": "business",
      "name": "Business",
      "credits": 1500,
      "price_usd": 199.99,
      "price_tzs": 500000,
      "per_credit_usd": 0.13,
      "savings": 35,
      "recommended": false
    }
  ],
  "generation_costs": {
    "background": 1,
    "onmodel": 2,
    "flatlay": 3,
    "mannequin": 3,
    "chat": 1,
    "legacy": 2
  },
  "currency": "TZS"
}
```

**UI Implementation Tips:**
- Display packages in a grid/card layout
- Highlight the `recommended` package
- Show savings percentage badge for packages with savings > 0
- Display both TZS and USD prices
- Show "per credit" pricing for comparison

---

## Payment Flow

### Step 1: Initiate Payment

#### POST /api/v1/payments/zenopay/create

Create a new payment and initiate the mobile money transaction.

**Request Body:**
```json
{
  "package_id": "basic",
  "buyer_phone": "0712345678"
}
```

**Field Validations:**
- `package_id`: Must be one of: "starter", "basic", "pro", "business"
- `buyer_phone`: Tanzanian phone number
  - Format 1: `0712345678` (10 digits starting with 0)
  - Format 2: `255712345678` (12 digits with country code)

**Example Request:**
```javascript
const initiatePayment = async (packageId, phoneNumber) => {
  const response = await fetch('https://your-api.com/api/v1/payments/zenopay/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      package_id: packageId,
      buyer_phone: phoneNumber
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
};
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "reference": "ZENO123456789",
  "amount_tzs": 62000,
  "credits": 150,
  "status": "pending",
  "message": "Payment in progress. Credits will be added once payment is confirmed."
}
```

**Error Responses:**

*400 Bad Request - Invalid Package:*
```json
{
  "error": "invalid package_id"
}
```

*400 Bad Request - Missing Phone:*
```json
{
  "error": "buyer_phone is required"
}
```

*401 Unauthorized - Not logged in:*
```json
{
  "error": "you must be authenticated to access this resource"
}
```

*424 Failed Dependency - Payment provider error:*
```json
{
  "error": "Payment provider error message"
}
```

**What Happens Next:**
1. User receives an USSD prompt on their phone
2. User enters their mobile money PIN
3. Payment is processed by mobile money provider
4. Webhook updates payment status automatically
5. Credits are added to user account upon successful payment

**UI Implementation Tips:**
- Show a loading spinner during payment initiation
- Store the `order_id` for status checking
- Display the payment instructions to user
- Show expected phone notification message
- Provide option to check status manually

---

### Step 2: Check Payment Status

#### GET /api/v1/payments/zenopay/status?order_id={order_id}

Check the current status of a payment.

**Query Parameters:**
- `order_id` (required): The order_id returned from payment creation

**Example Request:**
```javascript
const checkPaymentStatus = async (orderId) => {
  const response = await fetch(
    `https://your-api.com/api/v1/payments/zenopay/status?order_id=${orderId}`,
    {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
};
```

**Success Response (200 OK):**
```json
{
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "payment_status": "COMPLETED",
  "amount_tzs": 62000,
  "credits": 150,
  "channel": "MPESA-TZ",
  "reference": "ZENO123456789",
  "transaction_id": "PJ12345678",
  "created_at": "2025-11-26T10:30:00Z",
  "source": "zenopay_api"
}
```

**Payment Status Values:**
- `PENDING` - Payment initiated, waiting for user confirmation
- `COMPLETED` - Payment successful, credits added
- `FAILED` - Payment failed
- `CANCELLED` - Payment cancelled by user

**Channel Values:**
- `MPESA-TZ` - M-Pesa Tanzania
- `TIGO-TZ` - Tigo Pesa
- `AIRTEL-TZ` - Airtel Money

**Error Responses:**

*400 Bad Request:*
```json
{
  "error": "order_id query parameter is required"
}
```

*403 Forbidden - Trying to check another user's payment:*
```json
{
  "error": "your user account doesn't have the necessary permissions to perform that action"
}
```

*404 Not Found:*
```json
{
  "error": "the requested resource could not be found"
}
```

**Polling Strategy:**
```javascript
const pollPaymentStatus = async (orderId, maxAttempts = 30) => {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await checkPaymentStatus(orderId);
    
    if (status.payment_status === 'COMPLETED') {
      return { success: true, data: status };
    }
    
    if (status.payment_status === 'FAILED' || status.payment_status === 'CANCELLED') {
      return { success: false, data: status };
    }
    
    // Wait 3 seconds before next check
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  return { success: false, data: null, timeout: true };
};
```

**UI Implementation Tips:**
- Poll status every 3-5 seconds
- Show a progress indicator while pending
- Display success message and new credit balance when completed
- Show error message if failed/cancelled
- Allow user to retry payment on failure
- Stop polling after 90-120 seconds (timeout)

---

### Step 3: View Payment History

#### GET /api/v1/payments/history?page=1&page_size=20

Retrieve the user's payment history with pagination.

**Query Parameters:**
- `page` (optional): Page number, default: 1
- `page_size` (optional): Items per page, default: 20

**Example Request:**
```javascript
const getPaymentHistory = async (page = 1, pageSize = 20) => {
  const response = await fetch(
    `https://your-api.com/api/v1/payments/history?page=${page}&page_size=${pageSize}`,
    {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
};
```

**Success Response (200 OK):**
```json
{
  "payments": [
    {
      "id": 123,
      "user_id": 456,
      "order_id": "550e8400-e29b-41d4-a716-446655440000",
      "amount": 62000,
      "credits": 150,
      "payment_method": "zenopay",
      "status": "completed",
      "reference": "ZENO123456789",
      "buyer_phone": "0712345678",
      "metadata": "{\"channel\":\"MPESA-TZ\",\"transid\":\"PJ12345678\"}",
      "created_at": "2025-11-26T10:30:00Z",
      "updated_at": "2025-11-26T10:31:30Z",
      "completed_at": "2025-11-26T10:31:30Z"
    },
    {
      "id": 122,
      "user_id": 456,
      "order_id": "660e8400-e29b-41d4-a716-446655440001",
      "amount": 500,
      "credits": 50,
      "payment_method": "zenopay",
      "status": "completed",
      "reference": "ZENO123456788",
      "buyer_phone": "0712345678",
      "metadata": "",
      "created_at": "2025-11-25T15:20:00Z",
      "updated_at": "2025-11-25T15:21:15Z",
      "completed_at": "2025-11-25T15:21:15Z"
    }
  ],
  "metadata": {
    "current_page": 1,
    "page_size": 20,
    "total_records": 2
  }
}
```

**UI Implementation Tips:**
- Display payments in a table or list
- Show status with color coding (green=completed, yellow=pending, red=failed)
- Format timestamps in user's timezone
- Display amount in TZS with proper formatting (e.g., "TZS 62,000")
- Add pagination controls
- Allow filtering by status
- Show payment method icon/badge

---

## React Implementation Example

### Complete Payment Flow Component

```jsx
import React, { useState, useEffect } from 'react';

const PaymentFlow = ({ userToken, onPaymentSuccess }) => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch packages on mount
  useEffect(() => {
    fetchPackages();
  }, []);

  // Poll payment status when orderId is set
  useEffect(() => {
    if (orderId) {
      const interval = setInterval(() => {
        checkStatus();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [orderId]);

  const fetchPackages = async () => {
    try {
      const response = await fetch('https://your-api.com/api/v1/credits/pricing', {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      const data = await response.json();
      setPackages(data.packages);
    } catch (err) {
      setError('Failed to load packages');
    }
  };

  const initiatePayment = async () => {
    if (!selectedPackage || !phoneNumber) {
      setError('Please select a package and enter your phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://your-api.com/api/v1/payments/zenopay/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          package_id: selectedPackage.id,
          buyer_phone: phoneNumber
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();
      setOrderId(data.order_id);
      setPaymentStatus('pending');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!orderId) return;

    try {
      const response = await fetch(
        `https://your-api.com/api/v1/payments/zenopay/status?order_id=${orderId}`,
        {
          headers: { 'Authorization': `Bearer ${userToken}` }
        }
      );

      const data = await response.json();
      setPaymentStatus(data.payment_status.toLowerCase());

      if (data.payment_status === 'COMPLETED') {
        setLoading(false);
        onPaymentSuccess(data.credits);
      } else if (data.payment_status === 'FAILED' || data.payment_status === 'CANCELLED') {
        setLoading(false);
        setError('Payment was not completed');
      }
    } catch (err) {
      console.error('Failed to check status', err);
    }
  };

  return (
    <div className="payment-flow">
      {/* Package Selection */}
      {!orderId && (
        <div className="package-selection">
          <h2>Select a Package</h2>
          <div className="packages-grid">
            {packages.map(pkg => (
              <div
                key={pkg.id}
                className={`package-card ${selectedPackage?.id === pkg.id ? 'selected' : ''} ${pkg.recommended ? 'recommended' : ''}`}
                onClick={() => setSelectedPackage(pkg)}
              >
                {pkg.recommended && <span className="badge">Recommended</span>}
                <h3>{pkg.name}</h3>
                <p className="credits">{pkg.credits} Credits</p>
                <p className="price">TZS {pkg.price_tzs.toLocaleString()}</p>
                {pkg.savings > 0 && <p className="savings">Save {pkg.savings}%</p>}
              </div>
            ))}
          </div>

          <div className="phone-input">
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="0712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <small>Enter your M-Pesa, Tigo, or Airtel number</small>
          </div>

          <button onClick={initiatePayment} disabled={loading}>
            Pay TZS {selectedPackage?.price_tzs.toLocaleString()}
          </button>
        </div>
      )}

      {/* Payment Progress */}
      {orderId && paymentStatus === 'pending' && (
        <div className="payment-progress">
          <div className="spinner"></div>
          <h3>Payment in Progress</h3>
          <p>Check your phone for the payment prompt</p>
          <p>Enter your mobile money PIN to complete payment</p>
          <small>Order ID: {orderId}</small>
        </div>
      )}

      {/* Payment Success */}
      {paymentStatus === 'completed' && (
        <div className="payment-success">
          <h3>✓ Payment Successful!</h3>
          <p>{selectedPackage?.credits} credits added to your account</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => { setError(null); setOrderId(null); setPaymentStatus(null); }}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentFlow;
```

---

## Error Handling

### Common HTTP Status Codes

| Status Code | Description | Action |
|------------|-------------|---------|
| 200 | Success | Process the response data |
| 400 | Bad Request | Show validation error to user |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Show permission denied message |
| 404 | Not Found | Show "resource not found" message |
| 422 | Validation Error | Display field-specific errors |
| 424 | Failed Dependency | Show payment provider error |
| 500 | Server Error | Show generic error, retry option |

### Error Response Format

All errors follow this structure:
```json
{
  "error": "error message here"
}
```

Or for validation errors:
```json
{
  "error": {
    "field_name": "validation error message",
    "another_field": "another error message"
  }
}
```

---

## Best Practices

### 1. **Phone Number Validation**
```javascript
const validateTanzanianPhone = (phone) => {
  // Remove spaces and dashes
  phone = phone.replace(/[\s-]/g, '');
  
  // Check format: 0XXXXXXXXX (10 digits) or 255XXXXXXXXX (12 digits)
  const pattern = /^(0\d{9}|255\d{9})$/;
  return pattern.test(phone);
};
```

### 2. **Format Currency**
```javascript
const formatTZS = (amount) => {
  return `TZS ${amount.toLocaleString('en-TZ')}`;
};
```

### 3. **Handle Token Expiry**
```javascript
const apiCall = async (url, options) => {
  const response = await fetch(url, options);
  
  if (response.status === 401) {
    // Token expired, redirect to login
    window.location.href = '/login';
    return;
  }
  
  return response;
};
```

### 4. **Store Order ID Locally**
```javascript
// Store in localStorage for recovery
localStorage.setItem('pending_order_id', orderId);

// Clear on success
if (paymentStatus === 'completed') {
  localStorage.removeItem('pending_order_id');
}
```

### 5. **Timeout Handling**
```javascript
const checkPaymentWithTimeout = async (orderId, maxTime = 120000) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxTime) {
    const status = await checkPaymentStatus(orderId);
    
    if (status.payment_status !== 'PENDING') {
      return status;
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  throw new Error('Payment check timeout');
};
```

---

## Testing

### Test Phone Numbers
Use these test numbers in development/staging:
- M-Pesa: `0712345678`
- Tigo: `0765432109`
- Airtel: `0687654321`

### Test Flow
1. Select "Starter" package (TZS 500)
2. Use test phone number
3. Wait for status updates
4. Verify credits are added

---

## Support & Troubleshooting

### User doesn't receive USSD prompt
- Verify phone number format
- Check mobile network connectivity
- Ensure sufficient balance for transaction fees

### Payment stuck in "pending"
- Status typically updates within 30-60 seconds
- If stuck > 2 minutes, user can check payment history
- Contact support with `order_id`

### Credits not added after successful payment
- Check payment history to verify status
- Backend automatically processes completed payments
- If issue persists, contact support with `order_id`

---

## Summary

**Key Endpoints:**
- `GET /api/v1/credits/pricing` - Get packages
- `POST /api/v1/payments/zenopay/create` - Initiate payment
- `GET /api/v1/payments/zenopay/status` - Check status
- `GET /api/v1/payments/history` - View history

**Payment Flow:**
1. User selects package
2. Enters phone number
3. Initiates payment
4. Receives USSD prompt on phone
5. Enters PIN to confirm
6. Frontend polls status
7. Credits added automatically on success

**Remember:**
- Always include `Authorization` header
- Validate phone numbers client-side
- Poll status every 3-5 seconds
- Handle all error cases gracefully
- Store order_id for recovery
- Timeout after 2 minutes of polling

