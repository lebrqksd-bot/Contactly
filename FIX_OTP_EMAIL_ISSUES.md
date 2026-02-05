# Fix OTP Email and User Creation Issues

## Problems Identified

1. **Users created before OTP verification**: Users are being added to the `users` table immediately when OTP is sent, not after verification
2. **OTP emails not being received**: Emails might not be sent due to SMTP configuration issues

## Solution

### Step 1: Update Database Trigger (IMPORTANT)

Run this SQL in your Supabase SQL Editor to fix the user creation trigger:

1. Go to: https://bnxjvjcxctzbczodsaqa.supabase.co
2. Navigate to: **SQL Editor** → **New query**
3. Copy and paste the contents of `supabase/fix_otp_user_creation.sql`
4. Click **Run**

This will:
- Prevent user profile creation until email is confirmed (OTP verified)
- Only create users in `public.users` table after successful OTP verification
- Handle both new user creation and email confirmation updates

### Step 2: Check Email Configuration

1. **Verify SMTP is configured** (if you set it up):
   - Go to: **Settings** → **Auth** → **SMTP Settings**
   - Make sure SMTP is enabled and credentials are correct
   - Test the connection

2. **Check Email Templates**:
   - Go to: **Authentication** → **Email Templates**
   - Verify "Magic Link" template is configured
   - The OTP code should be in the email

3. **Check Spam Folder**:
   - OTP emails might be going to spam
   - Check your email's spam/junk folder

### Step 3: Verify Email Sending

1. **Check Supabase Logs**:
   - Go to: **Logs** → **Auth Logs**
   - Look for OTP sending attempts
   - Check for any errors

2. **Test with a valid email**:
   - Use a real email address you have access to
   - Check both inbox and spam folder
   - Wait a few minutes (emails can be delayed)

## How It Works Now

### Before Fix:
1. User enters email → OTP sent
2. User created in `auth.users` → **Trigger fires immediately**
3. User created in `public.users` → **❌ User exists before verification**

### After Fix:
1. User enters email → OTP sent
2. User created in `auth.users` (but `email_confirmed_at` is NULL)
3. Trigger checks `email_confirmed_at` → **No profile created yet** ✅
4. User verifies OTP → `email_confirmed_at` is set
5. Trigger fires again → **User profile created** ✅

## Troubleshooting

### Still not receiving emails?

1. **Check SMTP configuration**:
   - Make sure SMTP is properly configured in Supabase
   - Verify Gmail app password is correct
   - Check if Gmail daily limit (500 emails) is reached

2. **Check Supabase email settings**:
   - Go to: **Authentication** → **Providers** → **Email**
   - Make sure email provider is enabled
   - Check email confirmation settings

3. **Test email delivery**:
   - Try sending a test email from Supabase dashboard
   - Check if emails are being sent at all

### Users still created before verification?

1. **Verify trigger is updated**:
   - Run the SQL from `supabase/fix_otp_user_creation.sql`
   - Check that both triggers exist:
     - `on_auth_user_created` (checks email_confirmed_at)
     - `on_auth_user_email_confirmed` (creates user when email is confirmed)

2. **Check trigger execution**:
   - Go to: **Database** → **Triggers**
   - Verify triggers are active

## Code Changes Made

1. ✅ Updated `signInWithOTP` to provide better error messages
2. ✅ Updated `verifyOTP` to handle user creation properly
3. ✅ Created database trigger fix to prevent premature user creation
4. ✅ Improved error handling for email sending failures

---

**Next Steps:**
1. Run the SQL fix in Supabase
2. Test OTP flow with a valid email
3. Check that users are only created after OTP verification

