# Disable Email Confirmation in Supabase (For Development)

If you're getting "Email not confirmed" errors, you can disable email confirmation for easier development.

## Steps to Disable Email Confirmation:

1. Go to your Supabase project: https://bnxjvjcxctzbczodsaqa.supabase.co
2. Click on **Authentication** in the left sidebar
3. Click on **Providers** 
4. Find **Email** provider and click on it
5. Scroll down to **"Confirm email"** section
6. **Uncheck** the "Enable email confirmations" checkbox
7. Click **Save**

## After Disabling:

- Users can sign up and immediately sign in without email confirmation
- No confirmation emails will be sent
- This is recommended for development/testing only

## For Production:

- Keep email confirmation enabled for security
- Users will receive a confirmation email after signing up
- They need to click the link in the email before they can sign in

## Alternative: Use OTP Login

The app also supports OTP (One-Time Password) login which doesn't require email confirmation:
- Use the "OTP" tab in the login screen
- Enter your email
- You'll receive a code via email
- Enter the code to sign in

