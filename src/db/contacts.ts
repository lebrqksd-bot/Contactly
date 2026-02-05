import { getDatabase } from './database';
import { Contact, ContactPhone, ContactEmail } from '@/types';
import { randomUUID } from 'expo-crypto';

export const contactRepository = {
  // Get all contacts
  async getAll(userId?: string, includeDeleted = false): Promise<Contact[]> {
    const db = await getDatabase();
    let query = 'SELECT * FROM contacts WHERE 1=1';
    const params: any[] = [];

    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    if (!includeDeleted) {
      query += ' AND deleted = 0';
    }

    query += ' ORDER BY name ASC';

    const result = await db.getAllAsync(query, params);
    const contacts = result as any[];

    // Fetch phones and emails for each contact
    const contactsWithRelations = await Promise.all(
      contacts.map(async (contact) => {
        const phones = await contactRepository.getPhones(contact.id);
        const emails = await contactRepository.getEmails(contact.id);
        return {
          ...contact,
          categories: contact.categories ? JSON.parse(contact.categories) : [],
          deleted: contact.deleted === 1,
          phones,
          emails,
        } as Contact;
      })
    );

    return contactsWithRelations;
  },

  // Get contact by ID
  async getById(id: string): Promise<Contact | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<Contact>(
      'SELECT * FROM contacts WHERE id = ?',
      [id]
    );

    if (!result) return null;

    const phones = await contactRepository.getPhones(id);
    const emails = await contactRepository.getEmails(id);

    return {
      ...result,
      categories: result.categories ? JSON.parse(result.categories) : [],
      deleted: result.deleted === 1,
      phones,
      emails,
    } as Contact;
  },

  // Create contact
  async create(contact: Contact): Promise<Contact> {
    const db = await getDatabase();
    const id = contact.id || randomUUID();
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO contacts (
        id, user_id, name, company, designation_id, profile_image_url,
        notes, address, last_visit, categories, synced_at, local_updated_at,
        deleted, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        contact.user_id || null,
        contact.name,
        contact.company || null,
        contact.designation_id || null,
        contact.profile_image_url || null,
        contact.notes || null,
        contact.address || null,
        contact.last_visit || null,
        JSON.stringify(contact.categories || []),
        contact.synced_at || null,
        now,
        contact.deleted ? 1 : 0,
        now,
        now,
      ]
    );

    // Insert phones
    if (contact.phones && contact.phones.length > 0) {
      await Promise.all(
        contact.phones.map((phone) => contactRepository.createPhone(id, phone))
      );
    }

    // Insert emails
    if (contact.emails && contact.emails.length > 0) {
      await Promise.all(
        contact.emails.map((email) => contactRepository.createEmail(id, email))
      );
    }

    return contactRepository.getById(id) as Promise<Contact>;
  },

  // Update contact
  async update(contact: Contact): Promise<Contact> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    await db.runAsync(
      `UPDATE contacts SET
        name = ?, company = ?, designation_id = ?, profile_image_url = ?,
        notes = ?, address = ?, last_visit = ?, categories = ?,
        local_updated_at = ?, updated_at = ?
      WHERE id = ?`,
      [
        contact.name,
        contact.company || null,
        contact.designation_id || null,
        contact.profile_image_url || null,
        contact.notes || null,
        contact.address || null,
        contact.last_visit || null,
        JSON.stringify(contact.categories || []),
        now,
        now,
        contact.id,
      ]
    );

    // Update phones
    await contactRepository.deletePhones(contact.id!);
    if (contact.phones && contact.phones.length > 0) {
      await Promise.all(
        contact.phones.map((phone) => contactRepository.createPhone(contact.id!, phone))
      );
    }

    // Update emails
    await contactRepository.deleteEmails(contact.id!);
    if (contact.emails && contact.emails.length > 0) {
      await Promise.all(
        contact.emails.map((email) => contactRepository.createEmail(contact.id!, email))
      );
    }

    return contactRepository.getById(contact.id!) as Promise<Contact>;
  },

  // Delete contact (soft delete)
  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      'UPDATE contacts SET deleted = 1, local_updated_at = ?, updated_at = ? WHERE id = ?',
      [now, now, id]
    );
  },

  // Hard delete contact
  async hardDelete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM contacts WHERE id = ?', [id]);
  },

  // Get phones for contact
  async getPhones(contactId: string): Promise<ContactPhone[]> {
    const db = await getDatabase();
    const result = await db.getAllAsync<ContactPhone>(
      'SELECT * FROM contact_phones WHERE contact_id = ? ORDER BY is_primary DESC, label ASC',
      [contactId]
    );
    return result.map((phone) => ({
      ...phone,
      is_primary: phone.is_primary === 1,
    }));
  },

  // Create phone
  async createPhone(contactId: string, phone: ContactPhone): Promise<void> {
    const db = await getDatabase();
    const id = phone.id || randomUUID();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO contact_phones (id, contact_id, phone_number, normalized_phone, label, is_primary, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        contactId,
        phone.phone_number,
        phone.normalized_phone || null,
        phone.label || 'mobile',
        phone.is_primary ? 1 : 0,
        now,
        now,
      ]
    );
  },

  // Delete phones
  async deletePhones(contactId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM contact_phones WHERE contact_id = ?', [contactId]);
  },

  // Get emails for contact
  async getEmails(contactId: string): Promise<ContactEmail[]> {
    const db = await getDatabase();
    const result = await db.getAllAsync<ContactEmail>(
      'SELECT * FROM contact_emails WHERE contact_id = ? ORDER BY is_primary DESC, label ASC',
      [contactId]
    );
    return result.map((email) => ({
      ...email,
      is_primary: email.is_primary === 1,
    }));
  },

  // Create email
  async createEmail(contactId: string, email: ContactEmail): Promise<void> {
    const db = await getDatabase();
    const id = email.id || randomUUID();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO contact_emails (id, contact_id, email, label, is_primary, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        contactId,
        email.email,
        email.label || 'work',
        email.is_primary ? 1 : 0,
        now,
        now,
      ]
    );
  },

  // Delete emails
  async deleteEmails(contactId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM contact_emails WHERE contact_id = ?', [contactId]);
  },

  // Search contacts
  async search(query: string, userId?: string): Promise<Contact[]> {
    const db = await getDatabase();
    let sql = `
      SELECT DISTINCT c.* FROM contacts c
      LEFT JOIN contact_phones cp ON c.id = cp.contact_id
      LEFT JOIN contact_emails ce ON c.id = ce.contact_id
      WHERE c.deleted = 0
      AND (
        c.name LIKE ? OR
        c.company LIKE ? OR
        cp.phone_number LIKE ? OR
        ce.email LIKE ?
      )
    `;
    const params: any[] = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];

    if (userId) {
      sql += ' AND c.user_id = ?';
      params.push(userId);
    }

    sql += ' ORDER BY c.name ASC';

    const result = await db.getAllAsync(sql, params);
    const contacts = result as any[];

    const contactsWithRelations = await Promise.all(
      contacts.map(async (contact) => {
        const phones = await contactRepository.getPhones(contact.id);
        const emails = await contactRepository.getEmails(contact.id);
        return {
          ...contact,
          categories: contact.categories ? JSON.parse(contact.categories) : [],
          deleted: contact.deleted === 1,
          phones,
          emails,
        } as Contact;
      })
    );

    return contactsWithRelations;
  },
};

