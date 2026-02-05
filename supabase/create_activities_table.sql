-- Create contact_activities table
CREATE TABLE IF NOT EXISTS public.contact_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'message', 'email')),
  activity_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_activities_user_id ON public.contact_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_activities_contact_id ON public.contact_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_activities_activity_date ON public.contact_activities(activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_contact_activities_activity_type ON public.contact_activities(activity_type);

-- Enable RLS
ALTER TABLE public.contact_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own activities
CREATE POLICY "Users can read their own activities"
  ON public.contact_activities
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own activities
CREATE POLICY "Users can insert their own activities"
  ON public.contact_activities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own activities
CREATE POLICY "Users can update their own activities"
  ON public.contact_activities
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own activities
CREATE POLICY "Users can delete their own activities"
  ON public.contact_activities
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically set user_id from contact
CREATE OR REPLACE FUNCTION set_activity_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Get user_id from the contact
  SELECT user_id INTO NEW.user_id
  FROM public.contacts
  WHERE id = NEW.contact_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to set user_id automatically
CREATE TRIGGER set_activity_user_id_trigger
  BEFORE INSERT ON public.contact_activities
  FOR EACH ROW
  EXECUTE FUNCTION set_activity_user_id();

