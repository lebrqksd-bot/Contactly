# Deployment Guide for Contactly App

## Understanding Your App

This is a **React Native Expo app** that can run on:
- 📱 **Mobile**: iOS and Android (primary)
- 🌐 **Web**: Browser (secondary)

## Deployment Options

### Option 1: Deploy Mobile Apps (Recommended)

Your app is primarily designed for mobile devices. Deploy to app stores:

#### For Android (Google Play Store):
1. Build the app:
   ```bash
   npx eas build --platform android
   ```
2. Follow EAS Build prompts to create an account
3. Upload the APK/AAB to Google Play Console
4. Submit for review

#### For iOS (App Store):
1. Build the app:
   ```bash
   npx eas build --platform ios
   ```
2. Upload to App Store Connect
3. Submit for review

**Note**: You'll need:
- Apple Developer account ($99/year) for iOS
- Google Play Developer account ($25 one-time) for Android

---

### Option 2: Deploy Web Version to Use Your GoDaddy Domain

If you want to use your GoDaddy domain for the web version:

#### Step 1: Build Web Version
```bash
npx expo export:web
```

This creates a `web-build` folder with static files.

#### Step 2: Deploy Options

**A. Deploy to Expo (Easiest)**
```bash
npx expo publish --web
```
Then point your GoDaddy domain to Expo's hosting.

**B. Deploy to Vercel/Netlify (Recommended for Web)**
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`
3. Connect your GoDaddy domain in Vercel dashboard

**C. Deploy to GoDaddy Hosting (Traditional Web Hosting)**
1. Upload the `web-build` folder contents to your GoDaddy hosting
2. Configure your domain to point to the hosting
3. Note: GoDaddy traditional hosting may have limitations for React apps

---

### Option 3: Use GoDaddy Domain for Landing Page

Create a simple landing page that:
- Promotes your mobile app
- Provides download links to App Store/Play Store
- Uses your GoDaddy domain

Then deploy the actual app separately.

---

## Recommended Approach

1. **For Mobile**: Use EAS Build to create app store builds
2. **For Web**: Deploy to Vercel/Netlify and connect your GoDaddy domain
3. **For Landing**: Create a simple HTML page on GoDaddy that links to your app

---

## Quick Start: Deploy Web to Vercel

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Build web version:
   ```bash
   npx expo export:web
   ```

3. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

4. Deploy:
   ```bash
   cd web-build
   vercel --prod
   ```

5. In Vercel dashboard, add your GoDaddy domain

---

## Environment Variables for Production

Make sure to set these in your hosting platform:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET`

---

## Need Help?

- **Mobile Deployment**: See Expo docs - https://docs.expo.dev/build/introduction/
- **Web Deployment**: See Expo web docs - https://docs.expo.dev/workflow/web/
- **Vercel**: https://vercel.com/docs
- **Netlify**: https://docs.netlify.com/

