# Stripe Payment Integration - Frontend API Documentation

## Overview

This document describes the API endpoints for integrating Stripe card payments into the Vestis application. The integration supports:
- **One-time credit purchases** (buy credits once)
- **Monthly subscriptions** (auto-renew credits each month)
- **Customer billing portal** (manage payment methods, view invoices)

---

## Authentication

All endpoints require authentication via Bearer token:

```
Authorization: Bearer <access_token>
```

---

## Base URL

```
Production: https://api.vestis.com
Development: http://localhost:4000
```

---

## Endpoints

### 1. Create One-Time Payment Checkout

Creates a Stripe Checkout session for a one-time credit purchase.

**Endpoint:** `POST /api/v1/payments/stripe/checkout`

**Request Body:**
```json
{
  "package_id": "basic"
}
```

**Package Options:**
| package_id | Credits | Price (USD) | Description |
|------------|---------|-------------|-------------|
| `basic`    | 50      | $9.99       | Basic package |
| `pro`      | 200     | $19.99      | Pro package (recommended) |
| `business` | 500     | $49.99      | Business package |

**Success Response (200):**
```json
{
  "success": true,
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_xxxxx",
  "session_id": "cs_test_xxxxx",
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount_usd": 9.99,
  "credits": 50,
  "status": "pending",
  "message": "Redirect to checkout URL to complete payment"
}
```

**Error Responses:**
```json
// 400 Bad Request - Invalid package
{
  "error": "invalid package_id"
}

// 401 Unauthorized - Not logged in
{
  "error": "you must be authenticated to access this resource"
}

// 500 Server Error - Stripe configuration issue
{
  "error": "payment method not configured for this package"
}
```

**Frontend Implementation:**
```javascript
async function purchaseCredits(packageId) {
  const response = await fetch('/api/v1/payments/stripe/checkout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ package_id: packageId })
  });

  const data = await response.json();
  
  if (data.success) {
    // Redirect user to Stripe Checkout
    window.location.href = data.checkout_url;
  } else {
    // Handle error
    console.error(data.error);
  }
}
```

---

### 2. Create Subscription Checkout

Creates a Stripe Checkout session for a monthly subscription.

**Endpoint:** `POST /api/v1/payments/stripe/subscribe`

**Request Body:**
```json
{
  "package_id": "pro"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_xxxxx",
  "session_id": "cs_test_xxxxx",
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount_usd": 19.99,
  "credits": 200,
  "billing": "monthly",
  "status": "pending",
  "message": "Redirect to checkout URL to start subscription"
}
```

**Error Responses:**
```json
// 400 Bad Request - Already subscribed
{
  "error": "you already have an active subscription"
}

// 400 Bad Request - Invalid package
{
  "error": "invalid package_id"
}
```

**Frontend Implementation:**
```javascript
async function startSubscription(packageId) {
  const response = await fetch('/api/v1/payments/stripe/subscribe', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ package_id: packageId })
  });

  const data = await response.json();
  
  if (data.success) {
    // Redirect user to Stripe Checkout for subscription
    window.location.href = data.checkout_url;
  }
}
```

---

### 3. Get Subscription Status

Returns the current user's subscription status.

**Endpoint:** `GET /api/v1/user/subscription`

**Success Response (200):**
```json
// User with active subscription
{
  "has_subscription": true,
  "status": "active",
  "subscription_id": "sub_xxxxx",
  "period_end": "2026-02-14T00:00:00Z",
  "has_payment_history": true
}

// User without subscription
{
  "has_subscription": false,
  "status": null,
  "has_payment_history": true
}

// New user (never paid)
{
  "has_subscription": false,
  "status": null,
  "has_payment_history": false
}
```

**Subscription Status Values:**
| Status | Description |
|--------|-------------|
| `active` | Subscription is active and paid |
| `past_due` | Payment failed, in retry period |
| `canceled` | User canceled (may still have access until period_end) |
| `unpaid` | All payment retries failed |
| `null` | No subscription |

**Frontend Implementation:**
```javascript
async function getSubscriptionStatus() {
  const response = await fetch('/api/v1/user/subscription', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const data = await response.json();
  
  return {
    isSubscribed: data.has_subscription,
    status: data.status,
    periodEnd: data.period_end ? new Date(data.period_end) : null,
    canAccessPortal: data.has_payment_history
  };
}
```

---

### 4. Open Customer Billing Portal

Creates a Stripe Customer Portal session where users can:
- Update payment method
- View invoice history
- Cancel subscription
- Download receipts

**Endpoint:** `POST /api/v1/payments/stripe/portal`

**Request Body:** None required

**Success Response (200):**
```json
{
  "success": true,
  "portal_url": "https://billing.stripe.com/p/session/xxxxx",
  "message": "Redirect to portal URL to manage subscription"
}
```

**Error Responses:**
```json
// 400 Bad Request - No payment history
{
  "error": "no payment history found - make a purchase first"
}
```

**Frontend Implementation:**
```javascript
async function openBillingPortal() {
  const response = await fetch('/api/v1/payments/stripe/portal', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const data = await response.json();
  
  if (data.success) {
    // Open portal in new tab or redirect
    window.open(data.portal_url, '_blank');
  }
}
```

---

## Payment Flow Diagrams

### One-Time Purchase Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Pricing   │────>│   POST      │────>│   Stripe    │────>│   Success   │
│    Page     │     │  /checkout  │     │  Checkout   │     │    Page     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                          │                    │
                          │                    │ (webhook)
                          ▼                    ▼
                    Return checkout_url   Credits added
                                          to account
```

### Subscription Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Pricing   │────>│   POST      │────>│   Stripe    │────>│   Success   │
│    Page     │     │  /subscribe │     │  Checkout   │     │    Page     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               │ (webhook)
                                               ▼
                                    ┌─────────────────────┐
                                    │ Credits added       │
                                    │ Subscription active │
                                    └─────────────────────┘
                                               │
                                               │ (monthly - automatic)
                                               ▼
                                    ┌─────────────────────┐
                                    │ Invoice webhook     │
                                    │ Credits renewed     │
                                    └─────────────────────┘
```

---

## Redirect URLs

After payment, Stripe redirects users to these URLs:

| Outcome | Redirect URL |
|---------|--------------|
| Success | `{BASE_URL}/payment/success?order_id={order_id}&session_id={session_id}` |
| Cancel  | `{BASE_URL}/payment/cancel?order_id={order_id}` |

### Success Page Implementation

```javascript
// /payment/success page
function PaymentSuccessPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const orderId = searchParams.get('order_id');
  const sessionId = searchParams.get('session_id');

  // Show success message
  // Credits are added via webhook (may take a few seconds)
  // Optionally poll credit balance to show updated amount

  return (
    <div>
      <h1>Payment Successful!</h1>
      <p>Your credits have been added to your account.</p>
      <p>Order ID: {orderId}</p>
      <button onClick={() => window.location.href = '/dashboard'}>
        Go to Dashboard
      </button>
    </div>
  );
}
```

### Cancel Page Implementation

```javascript
// /payment/cancel page
function PaymentCancelPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const orderId = searchParams.get('order_id');

  return (
    <div>
      <h1>Payment Cancelled</h1>
      <p>Your payment was not completed.</p>
      <button onClick={() => window.location.href = '/pricing'}>
        Try Again
      </button>
    </div>
  );
}
```

---

## Complete React Example

```jsx
// PricingPage.jsx
import React, { useState, useEffect } from 'react';

const PACKAGES = [
  { id: 'basic', name: 'Basic', credits: 50, price: 9.99, savings: 15 },
  { id: 'pro', name: 'Pro', credits: 200, price: 19.99, savings: 25, recommended: true },
  { id: 'business', name: 'Business', credits: 500, price: 49.99, savings: 35 },
];

export function PricingPage() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [billingType, setBillingType] = useState('one-time'); // 'one-time' or 'subscription'

  // Fetch subscription status on mount
  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  async function fetchSubscriptionStatus() {
    try {
      const response = await fetch('/api/v1/user/subscription', {
        headers: { 'Authorization': `Bearer ${getAccessToken()}` }
      });
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
    }
  }

  async function handlePurchase(packageId) {
    setLoading(true);
    try {
      const endpoint = billingType === 'subscription' 
        ? '/api/v1/payments/stripe/subscribe'
        : '/api/v1/payments/stripe/checkout';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ package_id: packageId })
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkout_url;
      } else {
        alert(data.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleManageSubscription() {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/payments/stripe/portal', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getAccessToken()}` }
      });

      const data = await response.json();

      if (data.success) {
        window.open(data.portal_url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pricing-page">
      <h1>Choose Your Plan</h1>

      {/* Billing Toggle */}
      <div className="billing-toggle">
        <button 
          className={billingType === 'one-time' ? 'active' : ''}
          onClick={() => setBillingType('one-time')}
        >
          One-Time Purchase
        </button>
        <button 
          className={billingType === 'subscription' ? 'active' : ''}
          onClick={() => setBillingType('subscription')}
          disabled={subscription?.has_subscription}
        >
          Monthly Subscription
          {subscription?.has_subscription && ' (Active)'}
        </button>
      </div>

      {/* Package Cards */}
      <div className="packages">
        {PACKAGES.map(pkg => (
          <div key={pkg.id} className={`package-card ${pkg.recommended ? 'recommended' : ''}`}>
            {pkg.recommended && <span className="badge">Most Popular</span>}
            <h2>{pkg.name}</h2>
            <p className="credits">{pkg.credits} Credits</p>
            <p className="price">
              ${pkg.price}
              {billingType === 'subscription' && <span>/month</span>}
            </p>
            <p className="savings">Save {pkg.savings}%</p>
            <button 
              onClick={() => handlePurchase(pkg.id)}
              disabled={loading}
            >
              {loading ? 'Processing...' : 
                billingType === 'subscription' ? 'Subscribe' : 'Buy Now'}
            </button>
          </div>
        ))}
      </div>

      {/* Manage Subscription Button */}
      {subscription?.has_payment_history && (
        <div className="manage-subscription">
          <button onClick={handleManageSubscription} disabled={loading}>
            Manage Billing & Invoices
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Testing

### Test Card Numbers

Use these test cards in Stripe's test mode:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 3220` | 3D Secure authentication required |
| `4000 0000 0000 9995` | Payment declined |
| `4000 0000 0000 0341` | Card declined (attach fails) |

- **Expiry**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

---

## Error Handling

```javascript
async function handlePaymentError(response) {
  const data = await response.json();
  
  switch (response.status) {
    case 400:
      // Validation error or business logic error
      return { type: 'validation', message: data.error };
    
    case 401:
      // Not authenticated - redirect to login
      window.location.href = '/login';
      return { type: 'auth', message: 'Please log in to continue' };
    
    case 500:
      // Server error - try again later
      return { type: 'server', message: 'Something went wrong. Please try again.' };
    
    default:
      return { type: 'unknown', message: 'An unexpected error occurred' };
  }
}
```

---

## Questions?

Contact the backend team for:
- API issues or bugs
- Webhook testing/debugging
- Custom package requirements
- Stripe Dashboard access

---

*Last updated: January 14, 2026*

