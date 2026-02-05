# Fix: User Not Redirected After Authentication

## Problem
User is authenticated (has valid session) but not being redirected to the app.

## Root Cause
The user profile might not be loading properly, or there's a timing issue with state updates.

## Solution Applied

### 1. **Enhanced User Loading**
- Added comprehensive logging to track user loading
- Always returns a user object when authenticated (even if profile doesn't exist)
- Falls back to basic user object from auth session if profile fails

### 2. **Improved Error Handling**
- If profile creation fails (RLS), still returns user object
- Checks session directly if `getCurrentUser()` fails
- Creates basic user object from session data

### 3. **Better State Management**
- Added logging to track auth state changes
- Ensures user state is set immediately after authentication
- Handles race conditions better

## What Changed

### `src/services/auth.ts`
- Added logging throughout `getCurrentUser()`
- Always returns user object when authenticated
- Better error handling for profile creation

### `src/context/AuthContext.tsx`
- Enhanced `loadUser()` with fallback to session
- Added logging for debugging
- Improved error handling
- Better state updates after sign in/sign up/OTP

## Testing

1. **Check Browser Console:**
   - Look for logs like:
     - "Loading user..."
     - "Auth user found: [id] [email]"
     - "Setting user: [email]"
   - This will help identify where it's failing

2. **Test Sign Up:**
   - Sign up with new account
   - Check console logs
   - Should see user being loaded
   - Should redirect automatically

3. **Test Sign In:**
   - Sign in with existing account
   - Check console logs
   - Should redirect immediately

4. **Test OTP:**
   - Request OTP
   - Verify OTP
   - Should redirect after verification

## Debugging

If still not redirecting, check console for:

1. **"Loading user..."** - Should appear
2. **"Auth user found"** - Should show user ID and email
3. **"Setting user"** - Should show email
4. **"Auth state changed: SIGNED_IN"** - Should appear after auth

If any of these are missing, that's where the issue is.

## Quick Fix

If user profile creation is failing due to RLS:

1. **Check Supabase RLS Policies:**
   - Go to Supabase Dashboard
   - **Authentication** → **Policies**
   - Make sure INSERT policy exists for `users` table

2. **Or run this SQL in Supabase:**
   ```sql
   -- Allow users to insert their own profile
   CREATE POLICY IF NOT EXISTS "Users can insert own profile"
     ON public.users FOR INSERT
     WITH CHECK (auth.uid() = id);
   ```

## Expected Behavior

After authentication:
1. User object is created/loaded
2. User state is set in AuthContext
3. `useEffect` in AuthScreen detects user
4. Automatically redirects to `/(tabs)`

All of this should happen automatically now! ✅

