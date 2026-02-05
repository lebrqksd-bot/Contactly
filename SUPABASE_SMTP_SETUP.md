# Supabase Custom SMTP Setup Guide

## Overview

This guide will help you configure a custom SMTP provider (Gmail) in your Supabase project to reduce email bounce rates and have better control over email delivery.

**Project ID:** `bnxjvjcxctzbczodsaqa`  
**Project URL:** https://bnxjvjcxctzbczodsaqa.supabase.co

## Why Custom SMTP?

- ✅ Better control over email delivery
- ✅ Higher sending limits
- ✅ Better delivery metrics and tracking
- ✅ Reduces bounce rates from Supabase's default email service
- ✅ More reliable email delivery

## Step 1: Access SMTP Settings in Supabase

1. **Go to your Supabase Dashboard:**
   - Visit: https://app.supabase.com
   - Or directly: https://bnxjvjcxctzbczodsaqa.supabase.co

2. **Navigate to Settings:**
   - Click on the **Settings** icon (gear icon) in the left sidebar
   - Click on **"Auth"** in the settings menu

3. **Find SMTP Settings:**
   - Scroll down to the **"SMTP Settings"** section
   - Click on **"Enable Custom SMTP"** or **"Configure SMTP"**

## Step 2: Configure Gmail SMTP

Enter the following SMTP credentials:

### SMTP Configuration:

```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP Username: lebrqksd@gmail.com
SMTP Password: qtfj tsid rljx tzvf
Sender Email: lebrqksd@gmail.com
Sender Name: Contactly (or your preferred name)
Enable TLS: Yes (or True)
```

### Detailed Field Mapping:

| Field in Supabase | Value |
|-------------------|-------|
| **SMTP Host** | `smtp.gmail.com` |
| **SMTP Port** | `587` |
| **SMTP Username** | `lebrqksd@gmail.com` |
| **SMTP Password** | `qtfj tsid rljx tzvf` |
| **Sender Email** | `lebrqksd@gmail.com` |
| **Sender Name** | `Contactly` (optional, but recommended) |
| **Enable TLS** | `Yes` or `True` |

## Step 3: Test SMTP Configuration

1. After entering all the credentials, click **"Test Connection"** or **"Send Test Email"**
2. Enter a valid email address to receive the test email
3. Check your inbox (and spam folder) for the test email
4. If successful, click **"Save"** to apply the settings

## Step 4: Verify Email Templates (Optional)

1. Still in **Settings → Auth**
2. Scroll to **"Email Templates"** section
3. Review and customize email templates if needed:
   - **Confirm signup** - Email confirmation for new users
   - **Magic Link** - OTP/login emails
   - **Change Email Address** - Email change confirmations
   - **Reset Password** - Password reset emails

## Important Notes About Gmail SMTP

### Gmail App Password

The password `qtfj tsid rljx tzvf` is a Gmail App Password (not your regular Gmail password). This is correct and required for SMTP authentication.

### Gmail Sending Limits

- **Free Gmail accounts:** 500 emails per day
- **Google Workspace:** 2,000 emails per day (per user)
- If you exceed limits, consider:
  - Upgrading to Google Workspace
  - Using a dedicated email service (SendGrid, Mailgun, etc.)

### Security Best Practices

1. ✅ **App Passwords are secure** - They're specifically designed for third-party apps
2. ⚠️ **Don't share your app password** - Keep it confidential
3. ✅ **Monitor your Gmail account** - Check for any security alerts
4. ✅ **Use a dedicated email** - Consider creating a separate Gmail account for transactional emails

## Reducing Email Bounce Rates

### 1. Validate Email Addresses

Ensure your app validates email addresses before sending:

```typescript
// Example validation (already in your codebase)
// Check src/utils/validation.ts for email validation
```

### 2. Use Valid Test Addresses

When testing:
- ✅ Use real, valid email addresses
- ❌ Don't use fake or invalid emails
- ✅ Use your own email addresses for testing
- ✅ Consider using services like [Mailtrap](https://mailtrap.io) for development

### 3. Handle Invalid Emails Gracefully

Your app should:
- Validate email format before sending
- Show clear error messages for invalid emails
- Not send emails to obviously invalid addresses

### 4. Monitor Bounce Rates

1. **In Supabase Dashboard:**
   - Go to **Settings → Auth → Email Templates**
   - Check email delivery logs (if available)

2. **In Gmail:**
   - Check your Gmail account for bounce notifications
   - Monitor for any delivery issues

### 5. Best Practices

- ✅ Always validate email addresses on the client and server
- ✅ Use double opt-in for email subscriptions
- ✅ Provide clear unsubscribe options
- ✅ Don't send emails to addresses that have previously bounced
- ✅ Clean your email list regularly

## Troubleshooting

### "SMTP Connection Failed"

1. **Check Gmail App Password:**
   - Make sure you're using an App Password, not your regular password
   - Verify the password is correct (no extra spaces)

2. **Check Gmail Settings:**
   - Go to your Google Account settings
   - Enable "Less secure app access" (if still available)
   - Or ensure 2-Step Verification is enabled and you're using an App Password

3. **Check Firewall/Network:**
   - Ensure port 587 is not blocked
   - Try port 465 with SSL instead of TLS

### "Emails Not Sending"

1. **Check Gmail Sending Limits:**
   - You may have hit the daily limit (500 emails/day for free accounts)
   - Wait 24 hours or upgrade to Google Workspace

2. **Check Spam Folder:**
   - Emails might be going to spam
   - Check sender reputation

3. **Verify SMTP Settings:**
   - Double-check all credentials
   - Test with a different email service if needed

### "Authentication Failed"

1. **Regenerate App Password:**
   - Go to Google Account → Security → App Passwords
   - Generate a new app password
   - Update it in Supabase SMTP settings

2. **Check 2-Step Verification:**
   - App Passwords require 2-Step Verification to be enabled
   - Enable it in your Google Account settings

## Alternative SMTP Providers

If Gmail doesn't meet your needs, consider:

1. **SendGrid** - 100 emails/day free, then paid
2. **Mailgun** - 5,000 emails/month free
3. **Amazon SES** - Very affordable, pay-as-you-go
4. **Postmark** - Great for transactional emails
5. **Resend** - Modern API, good developer experience

## Next Steps

1. ✅ Configure SMTP in Supabase dashboard (follow steps above)
2. ✅ Test email sending with a valid address
3. ✅ Monitor bounce rates in the coming days
4. ✅ Implement email validation in your app (if not already done)
5. ✅ Review and clean your user email list

## Support

If you continue to experience issues:

1. **Supabase Support:**
   - Contact Supabase support through your dashboard
   - Check Supabase documentation: https://supabase.com/docs/guides/auth/auth-smtp

2. **Gmail Support:**
   - Google Account Help: https://support.google.com/accounts
   - Gmail SMTP documentation

3. **Check Your App:**
   - Review email validation logic
   - Check for any test emails being sent to invalid addresses
   - Review authentication flows that trigger emails

---

**Last Updated:** Based on Supabase email bounce warning  
**Status:** Ready to configure

