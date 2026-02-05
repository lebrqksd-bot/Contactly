import { supabase } from './supabase';
import { Contact, ContactPhone, ContactEmail, ContactFilter } from '@/types';

export const contactsService = {
  // Get all contacts from Supabase with optional filters
  async getAll(userId: string, filter?: ContactFilter): Promise<Contact[]> {
    let query = supabase
      .from('contacts')
      .select(`
        *,
        designation:designations(*),
        phones:contact_phones(*),
        emails:contact_emails(*)
      `)
      .eq('user_id', userId)
      .eq('deleted', false);

    // Apply search filter
    if (filter?.search) {
      const searchTerm = filter.search.toLowerCase();
      query = query.or(`name.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`);
    }

    // Apply category filter
    if (filter?.category) {
      query = query.contains('categories', [filter.category]);
    }

    // Apply type filter
    if (filter?.type === 'recent') {
      query = query.order('created_at', { ascending: false });
    } else if (filter?.type === 'favorite') {
      query = query.contains('categories', ['favorite']);
    } else {
      query = query.order('name', { ascending: true });
    }

    const { data, error } = await query;

    if (error) throw error;

    let contacts = (data || []).map((contact: any) => ({
      ...contact,
      designation: contact.designation || undefined,
      phones: contact.phones || [],
      emails: contact.emails || [],
    }));

    // Additional client-side filtering for phone/email/tags/website
    if (filter?.search) {
      const searchTerm = filter.search.toLowerCase();
      contacts = contacts.filter((contact) => {
        const matchesName = contact.name.toLowerCase().includes(searchTerm);
        const matchesPhone = contact.phones?.some((p: any) =>
          p.phone_number.toLowerCase().includes(searchTerm)
        );
        const matchesEmail = contact.emails?.some((e: any) =>
          e.email.toLowerCase().includes(searchTerm)
        );
        const matchesCompany = contact.company?.toLowerCase().includes(searchTerm);
        const matchesWebsite = contact.website?.toLowerCase().includes(searchTerm);
        const matchesTags = contact.tags?.some((tag: string) =>
          tag.toLowerCase().includes(searchTerm)
        );
        return matchesName || matchesPhone || matchesEmail || matchesCompany || matchesWebsite || matchesTags;
      });
    }

    return contacts;
  },

  // Get contact by ID
  async getById(id: string): Promise<Contact | null> {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        designation:designations(*),
        phones:contact_phones(*),
        emails:contact_emails(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      ...data,
      designation: data.designation || undefined,
      phones: data.phones || [],
      emails: data.emails || [],
    };
  },

  // Create contact
  async create(contact: Contact): Promise<Contact> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    const now = new Date().toISOString();

    // Insert contact
    const { data: contactData, error: contactError } = await supabase
      .from('contacts')
      .insert({
        user_id: user.id,
        name: contact.name,
        company: contact.company,
        designation_id: contact.designation_id,
        profile_image_url: contact.profile_image_url,
        notes: contact.notes,
        address: contact.address,
        website: contact.website && contact.website.trim() ? contact.website.trim() : null,
        birthday: contact.birthday && contact.birthday.trim() ? contact.birthday.trim() : null,
        tags: contact.tags || [],
        last_visit: contact.last_visit,
        categories: contact.categories || [],
        synced_at: now,
        local_updated_at: now,
      })
      .select()
      .single();

    if (contactError) throw contactError;

    const contactId = contactData.id;

    // Insert phones (only non-empty ones)
    if (contact.phones && contact.phones.length > 0) {
      const phones = contact.phones
        .filter(phone => phone.phone_number && phone.phone_number.trim() !== '')
        .map((phone) => ({
          contact_id: contactId,
          phone_number: phone.phone_number.trim(),
          normalized_phone: phone.normalized_phone || phone.phone_number.trim(),
          label: phone.label || 'mobile',
          is_primary: phone.is_primary || false,
        }));

      if (phones.length > 0) {
        const { error: phonesError } = await supabase
          .from('contact_phones')
          .insert(phones);

        if (phonesError) throw phonesError;
      }
    }

    // Insert emails (only non-empty ones)
    if (contact.emails && contact.emails.length > 0) {
      const emails = contact.emails
        .filter(email => email.email && email.email.trim() !== '')
        .map((email) => ({
          contact_id: contactId,
          email: email.email.trim(),
          label: email.label || 'work',
          is_primary: email.is_primary || false,
        }));

      if (emails.length > 0) {
        const { error: emailsError } = await supabase
          .from('contact_emails')
          .insert(emails);

        if (emailsError) throw emailsError;
      }
    }

    return this.getById(contactId) as Promise<Contact>;
  },

  // Update contact
  async update(contact: Contact): Promise<Contact> {
    if (!contact.id) throw new Error('Contact ID is required');

    const now = new Date().toISOString();

    // Update contact
    const { error: contactError } = await supabase
      .from('contacts')
      .update({
        name: contact.name,
        company: contact.company,
        designation_id: contact.designation_id,
        profile_image_url: contact.profile_image_url,
        notes: contact.notes,
        address: contact.address,
        website: contact.website && contact.website.trim() ? contact.website.trim() : null,
        birthday: contact.birthday && contact.birthday.trim() ? contact.birthday.trim() : null,
        tags: contact.tags || [],
        last_visit: contact.last_visit,
        categories: contact.categories || [],
        local_updated_at: now,
      })
      .eq('id', contact.id);

    if (contactError) throw contactError;

    // Delete existing phones and emails
    await supabase.from('contact_phones').delete().eq('contact_id', contact.id);
    await supabase.from('contact_emails').delete().eq('contact_id', contact.id);

    // Insert new phones (only non-empty ones)
    if (contact.phones && contact.phones.length > 0) {
      const phones = contact.phones
        .filter(phone => phone.phone_number && phone.phone_number.trim() !== '')
        .map((phone) => ({
          contact_id: contact.id!,
          phone_number: phone.phone_number.trim(),
          normalized_phone: phone.normalized_phone || phone.phone_number.trim(),
          label: phone.label || 'mobile',
          is_primary: phone.is_primary || false,
        }));

      if (phones.length > 0) {
        const { error: phonesError } = await supabase
          .from('contact_phones')
          .insert(phones);

        if (phonesError) throw phonesError;
      }
    }

    // Insert new emails (only non-empty ones)
    if (contact.emails && contact.emails.length > 0) {
      const emails = contact.emails
        .filter(email => email.email && email.email.trim() !== '')
        .map((email) => ({
          contact_id: contact.id!,
          email: email.email.trim(),
          label: email.label || 'work',
          is_primary: email.is_primary || false,
        }));

      if (emails.length > 0) {
        const { error: emailsError } = await supabase
          .from('contact_emails')
          .insert(emails);

        if (emailsError) throw emailsError;
      }
    }

    return this.getById(contact.id) as Promise<Contact>;
  },

  // Delete contact (soft delete)
  async delete(id: string): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('contacts')
      .update({ deleted: true, local_updated_at: now })
      .eq('id', id);

    if (error) throw error;
  },

  // Batch create contacts
  async batchCreate(contacts: Contact[]): Promise<Contact[]> {
    const results: Contact[] = [];
    for (const contact of contacts) {
      try {
        const created = await this.create(contact);
        results.push(created);
      } catch (error) {
        console.error('Error creating contact:', error);
      }
    }
    return results;
  },

  // Batch update contacts
  async batchUpdate(contacts: Contact[]): Promise<Contact[]> {
    const results: Contact[] = [];
    for (const contact of contacts) {
      try {
        const updated = await this.update(contact);
        results.push(updated);
      } catch (error) {
        console.error('Error updating contact:', error);
      }
    }
    return results;
  },
};

