import { supabase } from './supabase';
import { ContactActivity } from '@/types';

export const activitiesService = {
  // Get activities for a contact
  async getByContactId(contactId: string): Promise<ContactActivity[]> {
    const { data, error } = await supabase
      .from('contact_activities')
      .select('*')
      .eq('contact_id', contactId)
      .order('activity_date', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  },

  // Create activity
  async create(activity: Omit<ContactActivity, 'id' | 'created_at'>): Promise<ContactActivity> {
    const { data, error } = await supabase
      .from('contact_activities')
      .insert({
        ...activity,
        activity_date: activity.activity_date || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Log a call
  async logCall(contactId: string, description?: string): Promise<ContactActivity> {
    return this.create({
      contact_id: contactId,
      activity_type: 'call',
      description: description || 'Phone call',
      activity_date: new Date().toISOString(),
    });
  },

  // Log a message
  async logMessage(contactId: string, description?: string): Promise<ContactActivity> {
    return this.create({
      contact_id: contactId,
      activity_type: 'message',
      description: description || 'Message sent',
      activity_date: new Date().toISOString(),
    });
  },

  // Log an email
  async logEmail(contactId: string, description?: string): Promise<ContactActivity> {
    return this.create({
      contact_id: contactId,
      activity_type: 'email',
      description: description || 'Email sent',
      activity_date: new Date().toISOString(),
    });
  },

  // Get activity stats for a contact
  async getStats(contactId: string): Promise<{
    total_calls: number;
    total_messages: number;
    total_emails: number;
    last_activity?: string;
  }> {
    const { data, error } = await supabase
      .from('contact_activities')
      .select('activity_type, activity_date')
      .eq('contact_id', contactId);

    if (error) throw error;

    const stats = {
      total_calls: 0,
      total_messages: 0,
      total_emails: 0,
      last_activity: undefined as string | undefined,
    };

    if (data && data.length > 0) {
      data.forEach((activity) => {
        if (activity.activity_type === 'call') stats.total_calls++;
        else if (activity.activity_type === 'message') stats.total_messages++;
        else if (activity.activity_type === 'email') stats.total_emails++;
      });

      const sorted = data.sort((a, b) => 
        new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime()
      );
      stats.last_activity = sorted[0]?.activity_date;
    }

    return stats;
  },
};

