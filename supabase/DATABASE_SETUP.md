# Database Setup Guide

This guide will help you set up the required database tables for the Contactly app.

## Prerequisites

1. Access to your Supabase project dashboard
2. SQL Editor access in Supabase

## Setup Steps

### 1. Create Categories Table

Run the SQL script in `supabase/create_categories_table.sql`:

```bash
# In Supabase SQL Editor, copy and paste the contents of:
supabase/create_categories_table.sql
```

This will:
- Create the `categories` table
- Set up RLS (Row Level Security) policies
- Insert default categories (Personal, Company, Staff, Client, Vendor, Family, Friends)
- Create necessary indexes

### 2. Create Activities Table

Run the SQL script in `supabase/create_activities_table.sql`:

```bash
# In Supabase SQL Editor, copy and paste the contents of:
supabase/create_activities_table.sql
```

This will:
- Create the `contact_activities` table
- Set up RLS policies
- Create necessary indexes
- Set up automatic user_id assignment from contacts

### 3. Verify Tables

After running both scripts, verify the tables exist:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('categories', 'contact_activities');

-- Check default categories
SELECT * FROM public.categories WHERE is_default = true;
```

## Troubleshooting

### Error: "relation does not exist"

If you get this error, it means the table hasn't been created yet. Make sure you've run the SQL scripts in order.

### Error: "permission denied"

Make sure you're running the SQL scripts as a database administrator or with the appropriate permissions.

### Error: "duplicate key value"

If you see this when inserting default categories, it's safe to ignore - it means the defaults already exist.

## RLS Policies

Both tables have Row Level Security enabled:

- **Categories**: Users can only see their own categories and default categories
- **Activities**: Users can only see their own activities

## Default Categories

The following default categories are automatically created:
- Personal (Blue)
- Company (Green)
- Staff (Orange)
- Client (Purple)
- Vendor (Red)
- Family (Pink)
- Friends (Cyan)

Users cannot delete or modify default categories, but they can create their own custom categories.

