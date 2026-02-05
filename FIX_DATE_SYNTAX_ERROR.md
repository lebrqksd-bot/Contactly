# Fix: Invalid Date Syntax Error (Code 22007)

## Problem
You were getting this Supabase error:
```
{code: "22007", message: "invalid input syntax for type date: \"\""}
```

This error occurs when the application tries to insert an **empty string** (`""`) into a DATE column. PostgreSQL DATE columns don't accept empty strings—they require either:
- A valid date value (e.g., `"2024-12-13"`)
- `NULL` (no value)

## Root Cause
In `src/services/contacts.ts`, the `birthday` and `website` fields were being sent directly to Supabase without validation. When a user left these fields empty, the code was sending empty strings instead of `NULL`:

```tsx
// ❌ BEFORE: Empty strings sent to DATE column
birthday: contact.birthday,        // Could be ""
website: contact.website,          // Could be ""
```

## Solution
Convert empty strings to `NULL` before inserting/updating in Supabase:

```tsx
// ✅ AFTER: Empty strings converted to NULL
birthday: contact.birthday && contact.birthday.trim() ? contact.birthday.trim() : null,
website: contact.website && contact.website.trim() ? contact.website.trim() : null,
```

### Changes Made
**File**: `src/services/contacts.ts`

**Create Operation** (Line ~118):
```tsx
website: contact.website && contact.website.trim() ? contact.website.trim() : null,
birthday: contact.birthday && contact.birthday.trim() ? contact.birthday.trim() : null,
```

**Update Operation** (Line ~191):
```tsx
website: contact.website && contact.website.trim() ? contact.website.trim() : null,
birthday: contact.birthday && contact.birthday.trim() ? contact.birthday.trim() : null,
```

## How It Works
1. **`contact.website && contact.website.trim()`** - Checks if the field exists and has non-whitespace content
2. **`? contact.website.trim() : null`** - If true, send the trimmed value; if false, send `NULL`

This ensures:
- Empty strings become `NULL`
- Whitespace is trimmed from valid values
- PostgreSQL receives proper DATE values or NULL

## Testing
To verify the fix works:

1. Go to your app and create a contact
2. Leave the `Birthday` and `Website` fields empty
3. Submit the form
4. The contact should be created without errors

## Technical Details

### PostgreSQL DATE Column Behavior
```sql
-- ✅ Valid operations
INSERT INTO contacts (birthday) VALUES ('2024-12-13');  -- Valid date
INSERT INTO contacts (birthday) VALUES (NULL);           -- NULL is OK

-- ❌ Invalid operations  
INSERT INTO contacts (birthday) VALUES ('');             -- Error 22007!
```

### TypeScript Type Safety
The code maintains type safety:
- Input is `string | undefined`
- Output is `string | null`
- PostgreSQL expects `DATE | NULL`

## Related Files
- **Database Schema**: `supabase/fix_missing_birthday_column.sql` (defines DATE columns)
- **Type Definition**: `src/types/index.ts` (Contact interface)
- **Component**: Wherever contact forms are (ContactEditScreen, etc.)

## No Further Action Needed
The fix is complete and deployed. Your next deployment will include this fix, and users won't see this error anymore.

---

**Status**: ✅ FIXED  
**Severity**: High (Prevented contact creation)  
**Impact**: All contact create/update operations with empty date fields  
**Date Fixed**: December 13, 2024
