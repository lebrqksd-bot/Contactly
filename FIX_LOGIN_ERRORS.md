# Fix Login Errors - Explanation

## Errors You're Seeing

### 1. 400 Bad Request on Sign In
**Error:** `POST /auth/v1/token?grant_type=password 400 (Bad Request)`

**Causes:**
- ❌ Wrong email or password
- ❌ Email not confirmed (if email confirmation is enabled)
- ❌ Account doesn't exist

**Solution:**
- ✅ Check your email and password are correct
- ✅ If email confirmation is enabled, check your email and confirm
- ✅ Try signing up first if you don't have an account

### 2. User Profile Not Found (PGRST116)
**Error:** `Cannot coerce the result to a single JSON object` - "The result contains 0 rows"

**Cause:**
- User exists in Supabase Auth
- But no corresponding record in `public.users` table
- This happens if:
  - User was created before database trigger was set up
  - Database trigger didn't fire
  - RLS policy blocked profile creation

**Solution:**
✅ **Already Fixed!** The code now automatically creates the user profile if it doesn't exist.

### 3. 404 Errors (Favicon, etc.)
**Error:** `Failed to load resource: the server responded with a status of 404`

**Cause:**
- Missing favicon.ico file
- Some assets not found

**Solution:**
- ✅ These are harmless warnings
- ✅ Don't affect functionality
- ✅ Can be ignored or add missing assets later

### 4. Deprecated Parameters Warning
**Warning:** `using deprecated parameters for the initialization function`

**Cause:**
- Some library using old API
- Not critical

**Solution:**
- ✅ Can be ignored
- ✅ Doesn't affect functionality

---

## What I Fixed

### ✅ Auto-Create User Profile
The `getCurrentUser()` function now:
1. Tries to fetch user profile
2. If not found (PGRST116 error), automatically creates it
3. Returns user data even if profile creation fails

### ✅ Better Error Messages
Sign in now shows clearer error messages:
- "Invalid email or password" for wrong credentials
- "Please check your email..." for unconfirmed email

---

## How to Test

1. **Try Signing In:**
   - Use correct email and password
   - Should work now

2. **If Profile Missing:**
   - Code will auto-create it
   - No more PGRST116 errors

3. **Check Browser Console:**
   - Should see "User profile not found, creating it..." if profile was missing
   - Then should work normally

---

## Next Steps

1. **Rebuild and Redeploy:**
   ```bash
   npm run build:web
   cd dist
   vercel --prod --yes
   ```

2. **Or Test Locally:**
   - The fixes are in the code
   - Restart your dev server
   - Try signing in again

---

## Still Having Issues?

### If 400 Error Persists:
- Double-check email and password
- Try creating a new account
- Check Supabase dashboard for the user

### If Profile Still Not Found:
- Make sure database trigger is set up (run `fix_users_trigger.sql`)
- Check RLS policies allow INSERT
- Check Supabase logs for errors

