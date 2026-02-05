# Supabase Google OAuth Setup Guide

## Error: "Unsupported provider: provider is not enabled"

This error occurs because Google OAuth is not enabled in your Supabase project. Follow these steps to enable it.

## Step 1: Enable Google Provider in Supabase

1. **Go to your Supabase Dashboard:**
   - Visit: https://app.supabase.com
   - Or directly: https://bnxjvjcxctzbczodsaqa.supabase.co

2. **Navigate to Authentication:**
   - Click on **"Authentication"** in the left sidebar
   - Click on **"Providers"** in the submenu

3. **Enable Google Provider:**
   - Find **"Google"** in the list of providers
   - Toggle the switch to **"Enable"**
   - Click **"Save"**

## Step 2: Configure Google OAuth Credentials

You'll need to create OAuth credentials in Google Cloud Console:

### A. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** (if not already enabled)

### B. Create OAuth 2.0 Credentials

1. **Navigate to Credentials:**
   - Go to **"APIs & Services"** → **"Credentials"**
   - Click **"Create Credentials"** → **"OAuth client ID"**

2. **Configure OAuth Consent Screen** (if first time):
   - Choose **"External"** user type
   - Fill in required information:
     - App name: Contactly
     - User support email: your email
     - Developer contact: your email
   - Click **"Save and Continue"**
   - Add scopes (optional): `email`, `profile`
   - Click **"Save and Continue"**
   - Add test users (optional)
   - Click **"Save and Continue"**

3. **Create OAuth Client ID:**
   - Application type: **"Web application"**
   - Name: Contactly Web
   - **Authorized JavaScript origins:**
     ```
     https://bnxjvjcxctzbczodsaqa.supabase.co
     ```
   - **Authorized redirect URIs:**
     ```
     https://bnxjvjcxctzbczodsaqa.supabase.co/auth/v1/callback
     ```
   - Click **"Create"**
   - **Copy the Client ID and Client Secret**

### C. Add Credentials to Supabase

1. **Back in Supabase Dashboard:**
   - Go to **Authentication** → **Providers** → **Google**
   - Paste your **Client ID** (from Google Cloud Console)
   - Paste your **Client Secret** (from Google Cloud Console)
   - Click **"Save"**

## Step 3: Test Google Sign-In

1. Try signing in with Google in your app
2. You should be redirected to Google's sign-in page
3. After authentication, you'll be redirected back to your app

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure the redirect URI in Google Cloud Console exactly matches:
  ```
  https://bnxjvjcxctzbczodsaqa.supabase.co/auth/v1/callback
  ```

### "Invalid client" error
- Verify that Client ID and Client Secret are correct in Supabase
- Make sure there are no extra spaces when copying

### Provider still not enabled
- Refresh the Supabase dashboard
- Check that the toggle is actually enabled (green/on)
- Try disabling and re-enabling the provider

## Alternative: Disable Google Sign-In

If you don't want to use Google OAuth, you can:

1. **Remove Google button from UI** (edit `src/screens/AuthScreen.tsx`)
2. **Or handle the error gracefully** (already implemented in the code)

The app will continue to work with email/password authentication.

## Mobile App Configuration

For mobile apps, you may also need to:

1. **Add iOS Bundle ID** (if deploying to iOS):
   - In Google Cloud Console, create an iOS OAuth client
   - Add your bundle identifier

2. **Add Android Package Name** (if deploying to Android):
   - In Google Cloud Console, create an Android OAuth client
   - Add your package name and SHA-1 certificate fingerprint

---

**Project ID:** `bnxjvjcxctzbczodsaqa`  
**Project URL:** https://bnxjvjcxctzbczodsaqa.supabase.co

