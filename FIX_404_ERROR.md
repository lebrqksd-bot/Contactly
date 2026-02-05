# Fix 404 NOT_FOUND Error

## Problem

You're seeing a `404: NOT_FOUND` error, which typically means:
- The `categories` table doesn't exist
- The `contact_activities` table doesn't exist
- RLS policies are blocking access
- Table structure doesn't match what the code expects

## Solution

### Step 1: Run the Fix Script

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `supabase/fix_categories_activities.sql`
5. Click **Run** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

### Step 2: Verify Tables Exist

Run this query to verify the tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('categories', 'contact_activities');
```

You should see both tables listed.

### Step 3: Check Default Categories

Run this query to verify default categories exist:

```sql
SELECT * FROM public.categories WHERE is_default = true;
```

You should see 7 default categories (Personal, Company, Staff, Client, Vendor, Family, Friends).

### Step 4: Test RLS Policies

Run this query to test if you can read categories:

```sql
SELECT * FROM public.categories LIMIT 10;
```

If you get a permission error, the RLS policies might need adjustment.

## Alternative: Manual Table Creation

If the fix script doesn't work, you can manually create the tables:

### Create Categories Table

```sql
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#2196F3',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
```

### Create Activities Table

```sql
CREATE TABLE IF NOT EXISTS public.contact_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'message', 'email')),
  activity_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contact_activities_user_id ON public.contact_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_activities_contact_id ON public.contact_activities(contact_id);
ALTER TABLE public.contact_activities ENABLE ROW LEVEL SECURITY;
```

## Common Issues

### Issue: "relation does not exist"

**Solution**: The table hasn't been created. Run the fix script or create the tables manually.

### Issue: "permission denied"

**Solution**: Make sure you're running the SQL as a database administrator. Check your Supabase project settings.

### Issue: "duplicate key value"

**Solution**: This is safe to ignore - it means the data already exists.

### Issue: Still getting 404 after creating tables

**Solution**: 
1. Clear your browser cache
2. Refresh the app
3. Check the browser console for more detailed error messages
4. Verify RLS policies are correctly set up

## Need Help?

If you're still experiencing issues:
1. Check the Supabase logs in your dashboard
2. Look at the browser console for more detailed errors
3. Verify your Supabase project URL and API keys are correct
4. Make sure you're authenticated when testing

