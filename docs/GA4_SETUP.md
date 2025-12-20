# Google Analytics 4 Integration Guide

## Overview

Google Analytics 4 has been successfully integrated into your Vestis application! GA4 provides powerful analytics, user behavior tracking, conversion tracking, and detailed insights into how users interact with your app.

## What's Been Installed

### 1. **Analytics Utility** (`src/utils/analytics.ts`)
Comprehensive functions for tracking:
- **Custom Events**: Track any custom event with parameters
- **Page Views**: Automatic and manual page view tracking
- **User Properties**: Identify and track authenticated users
- **Pre-defined Events**: Ready-to-use functions for common events:
  - `AuthEvents` - Login, signup, logout
  - `FeatureEvents` - Image generation, uploads, downloads
  - `CommerceEvents` - Pricing views, purchases, cart actions
  - `EngagementEvents` - Sharing, support, tutorials

### 2. **Google Analytics Component** (`src/components/shared/GoogleAnalytics.tsx`)
A React component that:
- Initializes GA4 using Next.js third-party integration
- Automatically tracks page views on route changes
- Identifies authenticated users with their properties
- Integrates seamlessly with your auth system

### 3. **Integration** (`src/app/layout.tsx`)
GA4 has been integrated into your root layout, so it automatically tracks across all pages.

## Setup Instructions

### Step 1: Create Google Analytics 4 Property

1. Go to [Google Analytics](https://analytics.google.com)
2. Sign in with your Google account
3. Click **Admin** (gear icon in bottom left)
4. Click **Create Property**
5. Enter property details:
   - Property name: "Vestis" (or your preferred name)
   - Time zone: Select your timezone
   - Currency: USD (or your preferred currency)
6. Click **Next** and complete business details
7. Accept the terms of service

### Step 2: Create a Data Stream

1. After creating the property, you'll be prompted to set up a data stream
2. Select **Web** platform
3. Enter your website details:
   - Website URL: Your production domain (e.g., `https://vestis.app`)
   - Stream name: "Vestis Web App"
   - Enable **Enhanced measurement** (recommended)
4. Click **Create stream**

### Step 3: Get Your Measurement ID

1. After creating the stream, you'll see your **Measurement ID**
2. It looks like: `G-XXXXXXXXXX`
3. Copy this ID

### Step 4: Add to Environment Variables

Add to your `.env.local` file:

```bash
# Google Analytics Configuration
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

### Step 5: Restart Development Server

```bash
# Stop the current server (Ctrl + C)
pnpm dev
```

### Step 6: Verify Installation

1. Open your app in browser
2. Navigate a few pages
3. In GA4, go to **Reports** > **Realtime**
4. You should see your session appear within seconds!

## Features

### 📊 **Automatic Tracking**

**Page Views**: Every route change is automatically tracked

**User Identification**: Authenticated users are tracked with:
- User ID
- Email
- Name
- User type

### 🎯 **Custom Event Tracking**

The analytics utility provides ready-to-use event tracking functions:

#### **Authentication Events**

```typescript
import { AuthEvents } from '@/utils/analytics';

// Track login
AuthEvents.login('google');

// Track signup
AuthEvents.signUp('email');

// Track logout
AuthEvents.logout();
```

#### **Feature Usage Events**

```typescript
import { FeatureEvents } from '@/utils/analytics';

// Track image generation
FeatureEvents.generateImage('flatlay', 10);

// Track image upload
FeatureEvents.uploadImage('on-model');

// Track image download
FeatureEvents.downloadImage('mannequin');
```

#### **Commerce Events**

```typescript
import { CommerceEvents } from '@/utils/analytics';

// Track pricing page view
CommerceEvents.viewPricing();

// Track credit purchase
CommerceEvents.purchaseCredits(100, 9.99);

// Track add to cart
CommerceEvents.addToCart('100 Credits', 100, 9.99);
```

#### **Engagement Events**

```typescript
import { EngagementEvents } from '@/utils/analytics';

// Track image share
EngagementEvents.shareImage('flatlay');

// Track support contact
EngagementEvents.contactSupport();

// Track tutorial view
EngagementEvents.viewTutorial('getting-started');
```

### 📈 **Custom Events**

Track any custom event:

```typescript
import { trackEvent } from '@/utils/analytics';

trackEvent('custom_event_name', {
  parameter1: 'value1',
  parameter2: 123,
  parameter3: true,
});
```

### 👥 **User Properties**

Set custom user properties:

```typescript
import { setUserProperties } from '@/utils/analytics';

setUserProperties('user123', {
  subscription_tier: 'premium',
  account_age_days: 30,
  total_credits_purchased: 500,
});
```

## Implementation Examples

### Track Image Generation

Add to your image generation function:

```typescript
import { FeatureEvents } from '@/utils/analytics';

async function generateImage(feature: string) {
  // Your generation logic
  const result = await api.generateImage(...);
  
  // Track the event
  FeatureEvents.generateImage(feature, creditCost);
  
  return result;
}
```

### Track Purchase Completion

Add to your checkout success handler:

```typescript
import { CommerceEvents } from '@/utils/analytics';

function handlePurchaseSuccess(credits: number, amount: number) {
  // Track purchase
  CommerceEvents.purchaseCredits(credits, amount);
  
  // Show success message
  toast.success('Credits added!');
}
```

### Track Button Clicks

```typescript
import { trackEvent } from '@/utils/analytics';

<button onClick={() => {
  trackEvent('cta_click', {
    button_name: 'Get Started',
    location: 'hero_section',
  });
  // Navigate to signup
}}>
  Get Started
</button>
```

## GA4 Dashboard

### Key Reports

1. **Realtime**: See current active users
2. **Acquisition**: How users find your app
3. **Engagement**: Page views, events, conversions
4. **Monetization**: Revenue and purchase data
5. **Retention**: User retention over time
6. **Demographics**: User age, gender, interests
7. **Tech**: Device, browser, OS data

### Custom Reports

You can create custom reports and explorations to analyze:
- Conversion funnels
- User paths
- Event sequences
- Cohort analysis

### Conversions

Mark important events as conversions:
1. Go to **Admin** > **Events**
2. Find your event (e.g., `purchase`, `sign_up`)
3. Toggle **Mark as conversion**

## Privacy & Compliance

### GDPR Compliance

1. **Update Privacy Policy**: Mention GA4 usage
2. **Cookie Consent**: Implement consent banner if required
3. **Data Retention**: Configure in GA4 Admin settings
4. **User Rights**: Set up data deletion processes

### Anonymize IP Addresses

IP anonymization is automatic in GA4.

### Disable Analytics for Development

To disable GA4 in development, don't set the environment variable:

```typescript
// In layout.tsx - conditionally initialize
const gaId = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID 
  : undefined;
```

### Opt-Out Mechanism

Provide users an option to opt-out:

```typescript
// Add to settings page
function disableAnalytics() {
  window[`ga-disable-${measurementId}`] = true;
}
```

## Advanced Configuration

### Enhanced Measurement

GA4 automatically tracks (if enabled in stream settings):
- Page views
- Scrolls
- Outbound clicks
- Site search
- Video engagement
- File downloads

### Custom Dimensions

Create custom dimensions in GA4:
1. Go to **Admin** > **Custom Definitions**
2. Click **Create custom dimension**
3. Set up dimension (e.g., "User Tier", "Feature Used")

Then track with parameters:

```typescript
trackEvent('feature_used', {
  user_tier: 'premium', // Maps to custom dimension
  feature_name: 'flatlay',
});
```

### Debugging

Enable debug mode in development:

```typescript
// Add to your GoogleAnalytics component
<GoogleAnalytics 
  measurementId={gaId} 
  debug={process.env.NODE_ENV === 'development'}
/>
```

View debug messages in browser console and GA4 DebugView.

## Troubleshooting

### No Data in GA4

**Check Realtime Report**: Data appears within seconds

**Verify Measurement ID**: Ensure it starts with `G-`

**Check Browser Console**: Look for GA4 errors

**Ad Blockers**: Disable ad blockers for testing

**Environment Variable**: Verify it's set correctly:
```javascript
console.log(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
```

### Events Not Showing

**Wait Time**: Custom events can take 24-48 hours to appear in standard reports

**Use Realtime**: Check **Realtime** > **Event count by Event name**

**Check DebugView**: Enable debug mode to see events live

### User Properties Not Working

**Implementation Check**: Verify `setUserProperties` is called

**User ID**: Ensure user ID is provided

**Check GA4**: Go to **Admin** > **Data display** > **User data**

## Integration Checklist

- [ ] GA4 property created
- [ ] Data stream configured
- [ ] Measurement ID copied
- [ ] Environment variable added (`.env.local`)
- [ ] Dev server restarted
- [ ] Verified in Realtime report
- [ ] Key events marked as conversions
- [ ] Privacy policy updated
- [ ] Cookie consent implemented (if required)

## Resources

- [GA4 Documentation](https://support.google.com/analytics/topic/11151952)
- [GA4 Dashboard](https://analytics.google.com)
- [Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [Next.js Third Parties](https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries#google-analytics)
- [GA4 Migration Guide](https://support.google.com/analytics/answer/11583528)

## Next Steps

1. **Set Up Conversions**: Mark important events as conversions
2. **Create Custom Reports**: Build reports for your key metrics
3. **Set Up Alerts**: Get notified of important changes
4. **Link Google Ads**: If running ads, link your accounts
5. **Configure Audiences**: Create user segments for remarketing

---

**Happy Tracking! 📈✨**
