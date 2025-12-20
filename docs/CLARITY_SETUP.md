# Microsoft Clarity Integration Guide

## Overview

Microsoft Clarity has been successfully integrated into your Vestis application! Clarity provides free heatmaps, session recordings, and user analytics to help you understand how users interact with your application.

## What's Been Installed

The following components have been added to your project:

### 1. **Clarity Utility** (`src/utils/clarity.ts`)
Provides functions to interact with the Clarity API:
- `initClarity(projectId)` - Initialize Clarity with your project ID
- `identifyClarityUser(userId, sessionId, pageId, friendlyName)` - Identify authenticated users
- `setClarityTag(key, value)` - Set custom tags for session segmentation
- `upgradeClaritySession(reason)` - Mark important sessions

### 2. **Clarity Provider** (`src/components/shared/ClarityProvider.tsx`)
A React component that:
- Automatically initializes Clarity on app load
- Identifies users when they log in
- Adds custom tags like email, name, and user type
- Works seamlessly with your existing auth system

### 3. **Integration** (`src/providers/index.tsx`)
Clarity has been integrated into your app's provider tree, so it automatically starts tracking when users visit your site.

## Setup Instructions

### Step 1: Get Your Clarity Project ID

1. Go to [https://clarity.microsoft.com](https://clarity.microsoft.com)
2. Sign in with your Microsoft account (or create one)
3. Create a new project or select an existing one
4. Navigate to **Settings** > **Setup** > **Project ID**
5. Copy your Project ID (it looks like: `abc123def456`)

### Step 2: Add Project ID to Environment Variables

1. Create or edit the `.env.local` file in your project root:
   ```bash
   NEXT_PUBLIC_CLARITY_PROJECT_ID=your_project_id_here
   ```

2. Replace `your_project_id_here` with the Project ID you copied

3. **Important**: Restart your development server after adding the environment variable:
   ```bash
   # Stop the current server (Ctrl + C)
   pnpm dev
   ```

### Step 3: Verify Installation

1. Open your application in a browser
2. Open the browser's Developer Console (F12)
3. Look for the message: `✅ Microsoft Clarity initialized successfully`
4. Visit a few pages in your app
5. Return to [clarity.microsoft.com](https://clarity.microsoft.com) and check the dashboard
6. You should start seeing data within a few minutes

## Features

### 🎯 **Heatmaps**
See where users click, scroll, and spend time on your pages.

### 📹 **Session Recordings**
Watch real user sessions to understand their journey and identify issues.

### 📊 **Analytics Dashboard**
View metrics like:
- Page views
- User engagement
- Click patterns
- Scroll depth
- Rage clicks (frustration indicators)

### 👥 **User Identification**
Authenticated users are automatically identified with:
- User ID
- Email address
- Name
- User type tag

### 🏷️ **Custom Tags**
Sessions are tagged with useful information for filtering:
- `userEmail` - User's email address
- `userName` - User's name
- `userType` - "authenticated" for logged-in users

## Advanced Usage

### Upgrade Important Sessions

Mark sessions as important (e.g., when a user makes a purchase):

```typescript
import { upgradeClaritySession } from '@/utils/clarity';

// In your checkout success handler
upgradeClaritySession('Purchase completed');
```

### Add Custom Tags

Tag sessions for better segmentation:

```typescript
import { setClarityTag } from '@/utils/clarity';

// Track user tier
setClarityTag('userTier', 'premium');

// Track feature usage
setClarityTag('usedFeature', 'ai-flatlay');
```

### Manual User Identification

If you need to identify users manually:

```typescript
import { identifyClarityUser } from '@/utils/clarity';

identifyClarityUser(
  'user123',
  undefined,
  undefined,
  'john@example.com'
);
```

## Privacy & Compliance

### GDPR/Privacy Considerations

Microsoft Clarity is GDPR compliant, but you should:

1. **Update Privacy Policy**: Mention that you use Clarity for analytics
2. **Cookie Consent**: If required in your region, ensure users consent to analytics cookies
3. **Mask Sensitive Data**: Clarity automatically masks certain input types, but you can add custom masking:

```html
<input type="text" className="clarity-mask" />
```

### Disable Clarity in Development

If you want to disable Clarity during development, simply don't set the `NEXT_PUBLIC_CLARITY_PROJECT_ID` environment variable, or conditionally initialize it:

```typescript
// In ClarityProvider.tsx
const shouldInitClarity = process.env.NODE_ENV === 'production';
if (shouldInitClarity) {
  initClarity(projectId);
}
```

## Troubleshooting

### Clarity Not Initializing

**Check Console**: Look for error messages in the browser console

**Verify Environment Variable**: 
- Make sure `NEXT_PUBLIC_CLARITY_PROJECT_ID` is set in `.env.local`
- Restart your dev server after adding the variable
- Verify the variable is accessible: `console.log(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID)`

**Check Network Tab**: Look for requests to `clarity.ms`

### No Data in Dashboard

**Wait**: It can take a few minutes for data to appear

**Check Filters**: Make sure you're viewing the correct time range in Clarity dashboard

**Verify Initialization**: Check browser console for the success message

### Users Not Being Identified

**Check Auth State**: Ensure users are actually logged in when you expect identification to occur

**Console Logs**: Add temporary console logs to verify the `useEffect` in `ClarityProvider.tsx` is running

## Resources

- [Clarity Documentation](https://docs.microsoft.com/en-us/clarity/)
- [Clarity Dashboard](https://clarity.microsoft.com)
- [Clarity API Reference](https://www.npmjs.com/package/@microsoft/clarity)
- [Privacy & GDPR](https://docs.microsoft.com/en-us/clarity/setup-and-installation/privacy-disclosure)

## Support

If you encounter any issues with the Clarity integration:

1. Check the troubleshooting section above
2. Visit the [Clarity Help Center](https://docs.microsoft.com/en-us/clarity/)
3. Review your browser console for error messages

---

**Happy Analyzing! 📊✨**
