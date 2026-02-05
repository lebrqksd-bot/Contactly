# Fix OTP Redirect URL - Guide

## Problem
OTP email links are pointing to `localhost` instead of your production domain.

## Solution Applied

I've updated the code to automatically detect the current domain and use it for OTP redirects.

### For Web:
- Uses `window.location.origin` to get the current domain
- Example: `https://contactly.in`

### For Mobile:
- Uses app scheme: `contactly://`

## Additional Step: Configure in Supabase

You also need to add your domain to Supabase's allowed redirect URLs:

### Steps:

1. **Go to Supabase Dashboard:**
   - https://bnxjvjcxctzbczodsaqa.supabase.co
   - Or https://app.supabase.com

2. **Navigate to:**
   - **Authentication** → **URL Configuration**

3. **Add to "Redirect URLs":**
   ```
   https://contactly.in
   https://www.contactly.in
   https://dist-*.vercel.app
   contactly://
   ```

4. **Add to "Site URL":**
   ```
   https://contactly.in
   ```

5. **Save** the changes

## How It Works Now

1. User requests OTP
2. Code detects current domain (web) or app scheme (mobile)
3. OTP email contains link with correct redirect URL
4. User clicks link → Redirects to your domain
5. OTP is verified automatically

## Testing

1. **Rebuild and redeploy:**
   ```bash
   npm run build:web
   cd dist
   vercel --prod --yes
   ```

2. **Test OTP:**
   - Go to your website
   - Click "OTP" tab
   - Enter email
   - Check email - link should point to your domain!

## Important Notes

- ✅ Code now auto-detects domain
- ⚠️ Must also configure in Supabase dashboard
- ✅ Works for both web and mobile
- ✅ Handles Vercel preview URLs automatically

