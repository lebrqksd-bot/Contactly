# Fix: Missing User Profile (PGRST116 Error)

## Problem
User is authenticated but profile doesn't exist in `public.users` table, causing PGRST116 error.

## Solution

### Option 1: Run SQL in Supabase (Quick Fix)

1. **Go to Supabase Dashboard:**
   - https://app.supabase.com
   - Select your project
   - Go to **SQL Editor**

2. **Run this SQL:**
   ```sql
   -- Create profile for your user
   INSERT INTO public.users (id, email, full_name)
   VALUES (
     'db383563-809c-4879-8efb-7ef10c11f555',
     'vaishakbalakrishnan950@gmail.com',
     'vaishak'
   )
   ON CONFLICT (id) DO NOTHING;
   ```

3. **Verify it worked:**
   ```sql
   SELECT * FROM public.users WHERE id = 'db383563-809c-4879-8efb-7ef10c11f555';
   ```

### Option 2: Run Complete Fix Script

Run the SQL from `supabase/fix_user_profile.sql` in Supabase SQL Editor:

1. Open `supabase/fix_user_profile.sql`
2. Copy all SQL
3. Paste in Supabase SQL Editor
4. Run it

This will:
- ✅ Add INSERT policy
- ✅ Fix the trigger
- ✅ Create profile for existing users
- ✅ Ensure future users get profiles automatically

### Option 3: The Code Should Handle It

The code already handles this case:
- Detects PGRST116 error
- Tries to create profile
- If creation fails, returns basic user object
- User should still be able to access app

**But** if profile creation is failing due to RLS, you need to run Option 1 or 2 above.

---

## After Fixing

1. **Refresh your app**
2. **User should be logged in**
3. **Should redirect to contacts page**

---

## Prevention

The database trigger should automatically create profiles for new users. If it's not working:

1. Check if trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

2. If missing, run `supabase/fix_users_trigger.sql`

---

## Quick Test

After running the SQL, check browser console:
- Should see "User profile found: vaishakbalakrishnan950@gmail.com"
- Should redirect to app automatically

