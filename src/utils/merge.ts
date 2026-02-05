import { Contact, MergeCandidate } from '@/types';
import { phoneUtils } from './phone';

export const mergeUtils = {
  // Find duplicate contacts
  findDuplicates(contacts: Contact[]): MergeCandidate[][] {
    const groups: Map<string, MergeCandidate[]> = new Map();

    contacts.forEach((contact) => {
      const keys = this.getContactKeys(contact);
      let added = false;

      for (const key of keys) {
        if (groups.has(key)) {
          const group = groups.get(key)!;
          const similarity = this.calculateSimilarity(group[0].contact, contact);
          if (similarity > 0.5) {
            group.push({
              contact,
              similarity,
              reasons: this.getMergeReasons(group[0].contact, contact),
            });
            added = true;
            break;
          }
        }
      }

      if (!added) {
        const key = keys[0] || `contact-${contact.id}`;
        groups.set(key, [
          {
            contact,
            similarity: 1,
            reasons: [],
          },
        ]);
      }
    });

    // Return only groups with duplicates
    return Array.from(groups.values()).filter((group) => group.length > 1);
  },

  // Get contact keys for duplicate detection
  getContactKeys(contact: Contact): string[] {
    const keys: string[] = [];

    // Phone-based keys
    contact.phones?.forEach((phone) => {
      const normalized = phone.normalized_phone || phoneUtils.normalize(phone.phone_number);
      if (normalized) {
        keys.push(`phone-${normalized}`);
      }
    });

    // Email-based keys
    contact.emails?.forEach((email) => {
      keys.push(`email-${email.email.toLowerCase()}`);
    });

    // Name-based key (fuzzy)
    if (contact.name) {
      keys.push(`name-${contact.name.toLowerCase().trim()}`);
    }

    return keys;
  },

  // Calculate similarity between two contacts
  calculateSimilarity(contact1: Contact, contact2: Contact): number {
    let score = 0;
    let factors = 0;

    // Name similarity
    if (contact1.name && contact2.name) {
      const name1 = contact1.name.toLowerCase().trim();
      const name2 = contact2.name.toLowerCase().trim();
      if (name1 === name2) {
        score += 0.4;
      } else if (name1.includes(name2) || name2.includes(name1)) {
        score += 0.2;
      }
      factors += 0.4;
    }

    // Phone similarity
    const phones1 = new Set(
      contact1.phones?.map((p) => p.normalized_phone || phoneUtils.normalize(p.phone_number)) || []
    );
    const phones2 = new Set(
      contact2.phones?.map((p) => p.normalized_phone || phoneUtils.normalize(p.phone_number)) || []
    );
    const phoneIntersection = new Set([...phones1].filter((p) => phones2.has(p)));
    if (phones1.size > 0 || phones2.size > 0) {
      const phoneScore = phoneIntersection.size / Math.max(phones1.size, phones2.size);
      score += phoneScore * 0.3;
      factors += 0.3;
    }

    // Email similarity
    const emails1 = new Set(contact1.emails?.map((e) => e.email.toLowerCase()) || []);
    const emails2 = new Set(contact2.emails?.map((e) => e.email.toLowerCase()) || []);
    const emailIntersection = new Set([...emails1].filter((e) => emails2.has(e)));
    if (emails1.size > 0 || emails2.size > 0) {
      const emailScore = emailIntersection.size / Math.max(emails1.size, emails2.size);
      score += emailScore * 0.3;
      factors += 0.3;
    }

    return factors > 0 ? score / factors : 0;
  },

  // Get merge reasons
  getMergeReasons(contact1: Contact, contact2: Contact): string[] {
    const reasons: string[] = [];

    // Check phone match
    const phones1 = new Set(
      contact1.phones?.map((p) => p.normalized_phone || phoneUtils.normalize(p.phone_number)) || []
    );
    const phones2 = new Set(
      contact2.phones?.map((p) => p.normalized_phone || phoneUtils.normalize(p.phone_number)) || []
    );
    const phoneMatch = [...phones1].some((p) => phones2.has(p));
    if (phoneMatch) {
      reasons.push('Same phone number');
    }

    // Check email match
    const emails1 = new Set(contact1.emails?.map((e) => e.email.toLowerCase()) || []);
    const emails2 = new Set(contact2.emails?.map((e) => e.email.toLowerCase()) || []);
    const emailMatch = [...emails1].some((e) => emails2.has(e));
    if (emailMatch) {
      reasons.push('Same email address');
    }

    // Check name similarity
    if (contact1.name && contact2.name) {
      const name1 = contact1.name.toLowerCase().trim();
      const name2 = contact2.name.toLowerCase().trim();
      if (name1 === name2) {
        reasons.push('Same name');
      } else if (name1.includes(name2) || name2.includes(name1)) {
        reasons.push('Similar name');
      }
    }

    return reasons;
  },

  // Merge contacts
  merge(contacts: Contact[]): Contact {
    if (contacts.length === 0) {
      throw new Error('No contacts to merge');
    }

    const merged: Contact = {
      name: '',
      company: '',
      phones: [],
      emails: [],
      categories: [],
      local_updated_at: new Date().toISOString(),
    };

    // Prefer non-empty values
    for (const contact of contacts) {
      if (!merged.name && contact.name) {
        merged.name = contact.name;
      }
      if (!merged.company && contact.company) {
        merged.company = contact.company;
      }
      if (!merged.address && contact.address) {
        merged.address = contact.address;
      }
      if (!merged.notes && contact.notes) {
        merged.notes = contact.notes;
      }
      if (!merged.profile_image_url && contact.profile_image_url) {
        merged.profile_image_url = contact.profile_image_url;
      }
      if (!merged.designation_id && contact.designation_id) {
        merged.designation_id = contact.designation_id;
      }
      if (!merged.last_visit && contact.last_visit) {
        merged.last_visit = contact.last_visit;
      }

      // Union phones
      if (contact.phones) {
        const existingPhones = new Set(
          merged.phones?.map((p) => p.normalized_phone || phoneUtils.normalize(p.phone_number)) || []
        );
        contact.phones.forEach((phone) => {
          const normalized = phone.normalized_phone || phoneUtils.normalize(phone.phone_number);
          if (!existingPhones.has(normalized)) {
            merged.phones!.push(phone);
            existingPhones.add(normalized);
          }
        });
      }

      // Union emails
      if (contact.emails) {
        const existingEmails = new Set(merged.emails?.map((e) => e.email.toLowerCase()) || []);
        contact.emails.forEach((email) => {
          if (!existingEmails.has(email.email.toLowerCase())) {
            merged.emails!.push(email);
            existingEmails.add(email.email.toLowerCase());
          }
        });
      }

      // Union categories
      if (contact.categories) {
        const existingCategories = new Set(merged.categories || []);
        contact.categories.forEach((category) => {
          existingCategories.add(category);
        });
        merged.categories = Array.from(existingCategories);
      }
    }

    // Ensure at least one primary phone/email
    if (merged.phones && merged.phones.length > 0 && !merged.phones.some((p) => p.is_primary)) {
      merged.phones[0].is_primary = true;
    }
    if (merged.emails && merged.emails.length > 0 && !merged.emails.some((e) => e.is_primary)) {
      merged.emails[0].is_primary = true;
    }

    return merged;
  },
};

