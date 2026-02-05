# Supabase Setup Guide

## Step 1: Create Supabase Account & Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign in"**
3. Sign up with GitHub, Google, or email
4. Once logged in, click **"New Project"**
5. Fill in the form:
   - **Name**: Contact App (or any name you prefer)
   - **Database Password**: Create a strong password (save it securely!)
   - **Region**: Choose the region closest to you
   - **Pricing Plan**: Free tier is fine for development
6. Click **"Create new project"**
7. Wait 2-3 minutes for the project to be provisioned

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, click on the **Settings** icon (gear icon) in the left sidebar
2. Click on **"API"** in the settings menu
3. You'll see two important values:

### Project URL
- Located under **"Project URL"**
- Format: `https://xxxxxxxxxxxxx.supabase.co`
- Copy this value

### Anon/Public Key
- Located under **"Project API keys"** → **"anon"** or **"public"**
- This is a long JWT token
- Copy this value

⚠️ **Important**: Never commit your API keys to version control!

## Step 3: Set Up Database Schema

1. In your Supabase dashboard, click on **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `supabase/schema.sql` from this project
4. Copy the entire contents of that file
5. Paste it into the SQL Editor
6. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)
7. You should see: **"Success. No rows returned"**

This creates all the necessary tables, indexes, and security policies.

## Step 4: Create Storage Bucket

1. In your Supabase dashboard, click on **"Storage"** in the left sidebar
2. Click **"Create a new bucket"**
3. Fill in:
   - **Name**: `contact-images`
   - **Public bucket**: Toggle **ON** (so images can be accessed publicly)
4. Click **"Create bucket"**

## Step 5: Configure Environment Variables

1. In your project root directory, create a file named `.env` (if it doesn't exist)
2. Copy the contents from `.env.example`
3. Replace the placeholder values with your actual credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET=contact-images
```

**Example:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET=contact-images
```

4. Save the file

## Step 6: Verify Setup

1. Make sure your `.env` file is in the project root (same level as `package.json`)
2. Restart your Expo development server:
   ```bash
   npm start
   # or
   yarn start
   ```
3. Clear the cache if needed:
   ```bash
   npm start -- --clear
   ```

## Troubleshooting

### "Invalid API key" error
- Double-check that you copied the **anon/public** key (not the service_role key)
- Make sure there are no extra spaces in your `.env` file
- Restart your Expo server after changing `.env`

### "Table does not exist" error
- Make sure you ran the SQL schema from `supabase/schema.sql`
- Check the SQL Editor for any errors

### "Storage bucket not found" error
- Verify the bucket name is exactly `contact-images`
- Make sure the bucket is set to **Public**

### Environment variables not loading
- Make sure the `.env` file is in the project root
- Restart Expo with `--clear` flag
- Check that variable names start with `EXPO_PUBLIC_`

## Security Notes

- ✅ The **anon key** is safe to use in client-side code (it's public)
- ❌ Never expose the **service_role key** (it has admin access)
- ✅ Row Level Security (RLS) is enabled to protect your data
- ✅ The `.env` file is in `.gitignore` (don't commit it!)

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- Check your project's API logs in the Supabase dashboard

