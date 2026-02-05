export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
  designation?: string;
  education?: string;
  business?: string;
  created_at: string;
  updated_at: string;
}

export interface Designation {
  id: string;
  name: string;
  description?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactPhone {
  id?: string;
  contact_id?: string;
  phone_number: string;
  normalized_phone?: string;
  label: string;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ContactEmail {
  id?: string;
  contact_id?: string;
  email: string;
  label: string;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  color: string;
  icon?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactActivity {
  id: string;
  contact_id: string;
  activity_type: 'call' | 'message' | 'email' | 'meeting' | 'note' | 'other';
  description?: string;
  activity_date: string;
  created_at: string;
}

export interface Contact {
  id?: string;
  user_id?: string;
  name: string;
  company?: string;
  designation_id?: string;
  designation?: Designation;
  profile_image_url?: string;
  notes?: string;
  address?: string;
  website?: string;
  birthday?: string;
  tags?: string[];
  last_visit?: string;
  categories: string[];
  phones: ContactPhone[];
  emails: ContactEmail[];
  synced_at?: string;
  local_updated_at?: string;
  deleted?: boolean;
  created_at?: string;
  updated_at?: string;
  // Computed fields
  activities?: ContactActivity[];
  total_calls?: number;
  total_messages?: number;
  total_emails?: number;
}

export interface SharedContact {
  id: string;
  contact_id: string;
  shared_by: string;
  shared_with: string;
  access_type: 'view' | 'edit';
  created_at: string;
  updated_at: string;
  contact?: Contact;
}

export interface SyncLog {
  id: string;
  user_id: string;
  sync_type: 'upload' | 'download' | 'full';
  records_count: number;
  status: 'pending' | 'success' | 'failed';
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

export interface SyncQueueItem {
  id?: number;
  contact_id: string;
  operation: 'create' | 'update' | 'delete';
  data?: Contact;
  created_at?: string;
}

export interface ContactFilter {
  type: 'all' | 'staff' | 'company' | 'shared' | 'recent' | 'favorite';
  search?: string;
  category?: string;
  sortBy?: 'name' | 'recent' | 'recently_contacted' | 'birthday';
}

export interface MergeCandidate {
  contact: Contact;
  similarity: number;
  reasons: string[];
}

export interface CSVImportRow {
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  designation?: string;
  address?: string;
  notes?: string;
  [key: string]: any;
}

export interface ShareOptions {
  method: 'whatsapp' | 'sms' | 'email' | 'social' | 'vcard' | 'internal';
  contactIds: string[];
  recipientId?: string; // For internal sharing
  recipientEmail?: string; // For email sharing
  recipientPhone?: string; // For SMS/WhatsApp
}

