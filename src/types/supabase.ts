export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          user_id: string
          name: string
          company: string | null
          designation_id: string | null
          profile_image_url: string | null
          notes: string | null
          address: string | null
          last_visit: string | null
          categories: string[]
          synced_at: string
          local_updated_at: string
          deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          company?: string | null
          designation_id?: string | null
          profile_image_url?: string | null
          notes?: string | null
          address?: string | null
          last_visit?: string | null
          categories?: string[]
          synced_at?: string
          local_updated_at?: string
          deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          company?: string | null
          designation_id?: string | null
          profile_image_url?: string | null
          notes?: string | null
          address?: string | null
          last_visit?: string | null
          categories?: string[]
          synced_at?: string
          local_updated_at?: string
          deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      contact_phones: {
        Row: {
          id: string
          contact_id: string
          phone_number: string
          normalized_phone: string | null
          label: string
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          phone_number: string
          normalized_phone?: string | null
          label?: string
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          phone_number?: string
          normalized_phone?: string | null
          label?: string
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      contact_emails: {
        Row: {
          id: string
          contact_id: string
          email: string
          label: string
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          email: string
          label?: string
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          email?: string
          label?: string
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      designations: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      shared_contacts: {
        Row: {
          id: string
          contact_id: string
          shared_by: string
          shared_with: string
          access_type: 'view' | 'edit'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          shared_by: string
          shared_with: string
          access_type?: 'view' | 'edit'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          shared_by?: string
          shared_with?: string
          access_type?: 'view' | 'edit'
          created_at?: string
          updated_at?: string
        }
      }
      sync_log: {
        Row: {
          id: string
          user_id: string
          sync_type: 'upload' | 'download' | 'full'
          records_count: number
          status: 'pending' | 'success' | 'failed'
          error_message: string | null
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          sync_type: 'upload' | 'download' | 'full'
          records_count?: number
          status?: 'pending' | 'success' | 'failed'
          error_message?: string | null
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          sync_type?: 'upload' | 'download' | 'full'
          records_count?: number
          status?: 'pending' | 'success' | 'failed'
          error_message?: string | null
          started_at?: string
          completed_at?: string | null
        }
      }
    }
  }
}

