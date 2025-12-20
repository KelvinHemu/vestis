# Clarity Integration - Quick Start

## ✅ Installation Complete!

Microsoft Clarity has been successfully integrated into your Vestis application.

## 🚀 Quick Setup (2 steps)

### 1. Get your Clarity Project ID
- Visit [clarity.microsoft.com](https://clarity.microsoft.com)
- Sign in and create/select a project
- Copy your Project ID from Settings > Setup

### 2. Add to Environment Variables
Create or edit `.env.local` in your project root:

```bash
NEXT_PUBLIC_CLARITY_PROJECT_ID=your_project_id_here
```

Then restart your dev server:
```bash
pnpm dev
```

## ✨ That's It!!!

Clarity will now track:
- 📊 Page views and user behavior
- 🎯 Heatmaps showing where users click
- 📹 Session recordings
- 👥 Authenticated user identification

## 📚 Full Documentation

See [CLARITY_SETUP.md](./CLARITY_SETUP.md) for:
- Advanced features
- Custom tagging
- Session upgrading
- Privacy & GDPR compliance
- Troubleshooting

## 🔍 Verify It's Working

1. Open your app in a browser
2. Check browser console for: `✅ Microsoft Clarity initialized successfully`
3. Visit your Clarity dashboard - data appears within minutes

---

**Questions?** Check the full documentation or visit [clarity.microsoft.com](https://clarity.microsoft.com)
