-- Fix: Add missing birthday, website, and tags columns to contacts table
-- Run this in your Supabase SQL editor

-- Add missing columns if they don't exist
ALTER TABLE public.contacts 
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS birthday DATE,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_website ON public.contacts(website) WHERE website IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_birthday ON public.contacts(birthday) WHERE birthday IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_tags ON public.contacts USING GIN(tags);

-- Verify the columns were added
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'contacts' AND column_name IN ('birthday', 'website', 'tags')
ORDER BY ordinal_position;
