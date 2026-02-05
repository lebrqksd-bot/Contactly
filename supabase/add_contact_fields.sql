-- Add missing fields to contacts table
ALTER TABLE public.contacts 
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS birthday DATE,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create categories table for proper category management
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6200ee',
  icon TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create contact_activities table for activity log
CREATE TABLE IF NOT EXISTS public.contact_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'message', 'email', 'meeting', 'note', 'other')),
  description TEXT,
  activity_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_contacts_website ON public.contacts(website) WHERE website IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_birthday ON public.contacts(birthday) WHERE birthday IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_tags ON public.contacts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_contact_phones_normalized ON public.contact_phones(normalized_phone) WHERE normalized_phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contact_emails_email ON public.contact_emails(email);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_activities_contact_id ON public.contact_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_activities_date ON public.contact_activities(activity_date DESC);

-- Insert default categories
INSERT INTO public.categories (name, color, is_default, user_id)
VALUES 
  ('Personal', '#4CAF50', TRUE, NULL),
  ('Company', '#2196F3', TRUE, NULL),
  ('Staff', '#FF9800', TRUE, NULL),
  ('Client', '#9C27B0', TRUE, NULL),
  ('Vendor', '#F44336', TRUE, NULL),
  ('Family', '#E91E63', TRUE, NULL),
  ('Friends', '#00BCD4', TRUE, NULL)
ON CONFLICT DO NOTHING;

-- RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own and default categories"
  ON public.categories FOR SELECT
  USING (user_id = auth.uid() OR is_default = TRUE OR user_id IS NULL);

CREATE POLICY "Users can create own categories"
  ON public.categories FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories"
  ON public.categories FOR UPDATE
  USING (user_id = auth.uid() AND is_default = FALSE);

CREATE POLICY "Users can delete own categories"
  ON public.categories FOR DELETE
  USING (user_id = auth.uid() AND is_default = FALSE);

-- RLS for contact_activities
ALTER TABLE public.contact_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities for accessible contacts"
  ON public.contact_activities FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.contacts
    WHERE contacts.id = contact_activities.contact_id
    AND (contacts.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.shared_contacts
      WHERE shared_contacts.contact_id = contacts.id
      AND shared_contacts.shared_with = auth.uid()
    ))
  ));

CREATE POLICY "Users can create activities for accessible contacts"
  ON public.contact_activities FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.contacts
    WHERE contacts.id = contact_activities.contact_id
    AND (contacts.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.shared_contacts
      WHERE shared_contacts.contact_id = contacts.id
      AND shared_contacts.shared_with = auth.uid()
      AND shared_contacts.access_type = 'edit'
    ))
  ));

-- Trigger for categories updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

