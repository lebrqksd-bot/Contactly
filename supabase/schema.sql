-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Designations table
CREATE TABLE IF NOT EXISTS public.designations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, created_by)
);

-- Contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  designation_id UUID REFERENCES public.designations(id) ON DELETE SET NULL,
  profile_image_url TEXT,
  notes TEXT,
  address TEXT,
  last_visit TIMESTAMPTZ,
  categories TEXT[] DEFAULT '{}',
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  local_updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact phones table
CREATE TABLE IF NOT EXISTS public.contact_phones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  normalized_phone TEXT,
  label TEXT DEFAULT 'mobile',
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact emails table
CREATE TABLE IF NOT EXISTS public.contact_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  label TEXT DEFAULT 'work',
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shared contacts table
CREATE TABLE IF NOT EXISTS public.shared_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shared_with UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL DEFAULT 'view' CHECK (access_type IN ('view', 'edit')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contact_id, shared_with)
);

-- Sync log table
CREATE TABLE IF NOT EXISTS public.sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('upload', 'download', 'full')),
  records_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_deleted ON public.contacts(deleted);
CREATE INDEX IF NOT EXISTS idx_contacts_synced_at ON public.contacts(synced_at);
CREATE INDEX IF NOT EXISTS idx_contacts_local_updated_at ON public.contacts(local_updated_at);
CREATE INDEX IF NOT EXISTS idx_contact_phones_contact_id ON public.contact_phones(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_emails_contact_id ON public.contact_emails(contact_id);
CREATE INDEX IF NOT EXISTS idx_shared_contacts_shared_with ON public.shared_contacts(shared_with);
CREATE INDEX IF NOT EXISTS idx_shared_contacts_contact_id ON public.shared_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_user_id ON public.sync_log(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_designations_updated_at BEFORE UPDATE ON public.designations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_contacts_updated_at BEFORE UPDATE ON public.shared_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_phones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_log ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Contacts policies
CREATE POLICY "Users can view own contacts"
  ON public.contacts FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.shared_contacts
    WHERE shared_contacts.contact_id = contacts.id
    AND shared_contacts.shared_with = auth.uid()
  ));

CREATE POLICY "Users can insert own contacts"
  ON public.contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
  ON public.contacts FOR UPDATE
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.shared_contacts
    WHERE shared_contacts.contact_id = contacts.id
    AND shared_contacts.shared_with = auth.uid()
    AND shared_contacts.access_type = 'edit'
  ));

CREATE POLICY "Users can delete own contacts"
  ON public.contacts FOR DELETE
  USING (auth.uid() = user_id);

-- Contact phones policies
CREATE POLICY "Users can manage phones for accessible contacts"
  ON public.contact_phones FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.contacts
    WHERE contacts.id = contact_phones.contact_id
    AND (contacts.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.shared_contacts
      WHERE shared_contacts.contact_id = contacts.id
      AND shared_contacts.shared_with = auth.uid()
      AND shared_contacts.access_type = 'edit'
    ))
  ));

-- Contact emails policies
CREATE POLICY "Users can manage emails for accessible contacts"
  ON public.contact_emails FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.contacts
    WHERE contacts.id = contact_emails.contact_id
    AND (contacts.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.shared_contacts
      WHERE shared_contacts.contact_id = contacts.id
      AND shared_contacts.shared_with = auth.uid()
      AND shared_contacts.access_type = 'edit'
    ))
  ));

-- Designations policies
CREATE POLICY "Users can view own designations"
  ON public.designations FOR SELECT
  USING (created_by = auth.uid() OR created_by IS NULL);

CREATE POLICY "Users can create own designations"
  ON public.designations FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own designations"
  ON public.designations FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete own designations"
  ON public.designations FOR DELETE
  USING (created_by = auth.uid());

-- Shared contacts policies
CREATE POLICY "Users can view shared contacts"
  ON public.shared_contacts FOR SELECT
  USING (shared_by = auth.uid() OR shared_with = auth.uid());

CREATE POLICY "Users can create shares for own contacts"
  ON public.shared_contacts FOR INSERT
  WITH CHECK (
    shared_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.contacts
      WHERE contacts.id = shared_contacts.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own shares"
  ON public.shared_contacts FOR UPDATE
  USING (shared_by = auth.uid());

CREATE POLICY "Users can delete own shares"
  ON public.shared_contacts FOR DELETE
  USING (shared_by = auth.uid() OR shared_with = auth.uid());

-- Sync log policies
CREATE POLICY "Users can view own sync logs"
  ON public.sync_log FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own sync logs"
  ON public.sync_log FOR INSERT
  WITH CHECK (user_id = auth.uid());

