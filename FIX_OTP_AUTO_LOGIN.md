# Fix OTP Auto-Login After Email Click

## Problem
After clicking the OTP link in email, user gets redirected to login page instead of being automatically logged in.

## Solution Applied

I've added automatic OTP verification from URL parameters:

### 1. **Enabled Supabase URL Session Detection**
- Set `detectSessionInUrl: true` for web
- Supabase will automatically detect sessions from URL hash

### 2. **Added Manual OTP Verification**
- Checks URL for OTP tokens when app loads
- Automatically verifies OTP if found
- Clears URL parameters after verification

### 3. **Updated AuthContext**
- Checks for OTP in URL on app load
- Automatically verifies and logs user in

## How It Works

1. **User clicks OTP link in email:**
   - Link: `https://yourdomain.com/#access_token=xxx&refresh_token=yyy&type=email`
   - Or: `https://yourdomain.com/?token=xxx&type=email`

2. **App loads and detects tokens:**
   - AuthContext checks URL on mount
   - Finds OTP tokens in URL hash/query params

3. **Automatic verification:**
   - Verifies OTP with Supabase
   - Sets session automatically
   - Loads user profile

4. **Redirects to app:**
   - User is logged in
   - Redirected to main app (not login page)

## Testing

1. **Rebuild and redeploy:**
   ```bash
   npm run build:web
   cd dist
   vercel --prod --yes
   ```

2. **Test OTP flow:**
   - Go to your website
   - Request OTP
   - Check email
   - Click the link
   - Should automatically log you in! ✅

## What Changed

### `src/services/supabase.ts`
- Enabled `detectSessionInUrl` for web

### `src/services/auth.ts`
- Added `verifyOTPFromURL()` function
- Handles both hash and query params
- Clears URL after verification

### `src/context/AuthContext.tsx`
- Checks for OTP in URL on mount
- Automatically verifies if found

## Important Notes

- ✅ Works with Supabase's built-in URL detection
- ✅ Also has manual fallback verification
- ✅ Clears URL parameters after verification
- ✅ Handles both hash (`#token=xxx`) and query (`?token=xxx`) formats

## Troubleshooting

### If still redirecting to login:

1. **Check Supabase redirect URL:**
   - Make sure your domain is in Supabase's allowed redirect URLs
   - Authentication → URL Configuration

2. **Check browser console:**
   - Look for errors in console
   - Check if tokens are being detected

3. **Verify URL format:**
   - OTP link should include tokens
   - Format: `#access_token=xxx` or `?token=xxx`

4. **Check Supabase email template:**
   - Make sure email includes redirect URL
   - Should point to your domain, not localhost

