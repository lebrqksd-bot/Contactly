-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#2196F3',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT categories_name_user_unique UNIQUE (name, user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_default ON public.categories(is_default);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own categories and default categories
CREATE POLICY "Users can read their own categories and defaults"
  ON public.categories
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    is_default = true OR 
    user_id IS NULL
  );

-- Users can insert their own categories
CREATE POLICY "Users can insert their own categories"
  ON public.categories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own categories (not defaults)
CREATE POLICY "Users can update their own categories"
  ON public.categories
  FOR UPDATE
  USING (auth.uid() = user_id AND is_default = false)
  WITH CHECK (auth.uid() = user_id AND is_default = false);

-- Users can delete their own categories (not defaults)
CREATE POLICY "Users can delete their own categories"
  ON public.categories
  FOR DELETE
  USING (auth.uid() = user_id AND is_default = false);

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

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

