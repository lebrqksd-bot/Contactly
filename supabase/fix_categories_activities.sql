-- Fix categories and activities tables if they don't exist or have issues

-- First, ensure categories table exists with correct structure
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') THEN
    CREATE TABLE public.categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#2196F3',
      is_default BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      CONSTRAINT categories_name_user_unique UNIQUE (name, COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid))
    );
    
    CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
    CREATE INDEX IF NOT EXISTS idx_categories_is_default ON public.categories(is_default);
    
    ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
    
    -- Insert default categories
    INSERT INTO public.categories (name, color, is_default, user_id) VALUES
      ('Personal', '#2196F3', true, NULL),
      ('Company', '#4CAF50', true, NULL),
      ('Staff', '#FF9800', true, NULL),
      ('Client', '#9C27B0', true, NULL),
      ('Vendor', '#F44336', true, NULL),
      ('Family', '#E91E63', true, NULL),
      ('Friends', '#00BCD4', true, NULL)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Ensure contact_activities table exists with user_id column
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contact_activities') THEN
    CREATE TABLE public.contact_activities (
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
    CREATE INDEX IF NOT EXISTS idx_contact_activities_activity_date ON public.contact_activities(activity_date DESC);
    
    ALTER TABLE public.contact_activities ENABLE ROW LEVEL SECURITY;
  ELSE
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contact_activities' AND column_name = 'user_id') THEN
      ALTER TABLE public.contact_activities ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_contact_activities_user_id ON public.contact_activities(user_id);
      
      -- Populate user_id from contacts
      UPDATE public.contact_activities ca
      SET user_id = c.user_id
      FROM public.contacts c
      WHERE ca.contact_id = c.id;
    END IF;
  END IF;
END $$;

-- RLS Policies for categories
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can read their own categories and defaults" ON public.categories;
  DROP POLICY IF EXISTS "Users can insert their own categories" ON public.categories;
  DROP POLICY IF EXISTS "Users can update their own categories" ON public.categories;
  DROP POLICY IF EXISTS "Users can delete their own categories" ON public.categories;
  
  -- Create new policies
  CREATE POLICY "Users can read their own categories and defaults"
    ON public.categories FOR SELECT
    USING (auth.uid() = user_id OR is_default = true OR user_id IS NULL);
  
  CREATE POLICY "Users can insert their own categories"
    ON public.categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  
  CREATE POLICY "Users can update their own categories"
    ON public.categories FOR UPDATE
    USING (auth.uid() = user_id AND is_default = false)
    WITH CHECK (auth.uid() = user_id AND is_default = false);
  
  CREATE POLICY "Users can delete their own categories"
    ON public.categories FOR DELETE
    USING (auth.uid() = user_id AND is_default = false);
END $$;

-- RLS Policies for contact_activities
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can read their own activities" ON public.contact_activities;
  DROP POLICY IF EXISTS "Users can insert their own activities" ON public.contact_activities;
  DROP POLICY IF EXISTS "Users can update their own activities" ON public.contact_activities;
  DROP POLICY IF EXISTS "Users can delete their own activities" ON public.contact_activities;
  
  -- Create new policies
  CREATE POLICY "Users can read their own activities"
    ON public.contact_activities FOR SELECT
    USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can insert their own activities"
    ON public.contact_activities FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  
  CREATE POLICY "Users can update their own activities"
    ON public.contact_activities FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  
  CREATE POLICY "Users can delete their own activities"
    ON public.contact_activities FOR DELETE
    USING (auth.uid() = user_id);
END $$;

-- Function to automatically set user_id from contact
CREATE OR REPLACE FUNCTION set_activity_user_id()
RETURNS TRIGGER AS $$
BEGIN
  SELECT user_id INTO NEW.user_id
  FROM public.contacts
  WHERE id = NEW.contact_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS set_activity_user_id_trigger ON public.contact_activities;
CREATE TRIGGER set_activity_user_id_trigger
  BEFORE INSERT ON public.contact_activities
  FOR EACH ROW
  EXECUTE FUNCTION set_activity_user_id();

-- Updated_at trigger for categories
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

