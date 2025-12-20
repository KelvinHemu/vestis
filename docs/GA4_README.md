# Google Analytics 4 - Quick Start

## ✅ Installation Complete!

Google Analytics 4 has been successfully integrated into your Vestis application.

## 🚀 Quick Setup (3 steps)

### 1. Create GA4 Property
- Visit [analytics.google.com](https://analytics.google.com)
- Click **Admin** → **Create Property**
- Set up a **Web** data stream
- Copy your **Measurement ID** (G-XXXXXXXXXX)

### 2. Add to Environment Variables
Edit `.env.local` in your project root:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. Restart Server
```bash
pnpm dev
```

## ✨ What's Now Tracking

- **📊 Page Views**: Automatic on every route change
- **👥 Users**: Authenticated user identification
- **🎯 Events**: Ready-to-use event tracking functions
- **💰 Commerce**: Purchase and conversion tracking

## 🎯 Track Custom Events

### Authentication
```typescript
import { AuthEvents } from '@/utils/analytics';

AuthEvents.login('google');
AuthEvents.signUp('email');
AuthEvents.logout();
```

### Features
```typescript
import { FeatureEvents } from '@/utils/analytics';

FeatureEvents.generateImage('flatlay', 10);
FeatureEvents.uploadImage('on-model');
FeatureEvents.downloadImage('mannequin');
```

### Commerce
```typescript
import { CommerceEvents } from '@/utils/analytics';

CommerceEvents.viewPricing();
CommerceEvents.purchaseCredits(100, 9.99);
CommerceEvents.addToCart('100 Credits', 100, 9.99);
```

### Custom Events
```typescript
import { trackEvent } from '@/utils/analytics';

trackEvent('button_click', {
  button_name: 'Get Started',
  location: 'hero',
});
```

## 🔍 Verify It's Working

1. Open your app
2. Navigate a few pages
3. Go to [GA4 Dashboard](https://analytics.google.com)
4. Check **Reports** → **Realtime**
5. See your session appear! 🎉

## 📚 Full Documentation

See [GA4_SETUP.md](./GA4_SETUP.md) for:
- Detailed setup instructions
- All tracking functions
- Privacy & GDPR compliance
- Custom dimensions
- Troubleshooting
- Advanced features

---

**Start tracking insights now! 📈**
