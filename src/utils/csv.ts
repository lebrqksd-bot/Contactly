import Papa from 'papaparse';
import { Contact, CSVImportRow, ContactPhone, ContactEmail } from '@/types';
import { phoneUtils } from './phone';

// Map common column name variations to standard names
const columnMappings: Record<string, string> = {
  'name': 'name',
  'full_name': 'name',
  'fullname': 'name',
  'full name': 'name',
  'contact name': 'name',
  'contact': 'name',
  'phone': 'phone',
  'phone_number': 'phone',
  'phone number': 'phone',
  'mobile': 'phone',
  'mobile_number': 'phone',
  'mobile number': 'phone',
  'cell': 'phone',
  'telephone': 'phone',
  'tel': 'phone',
  'email': 'email',
  'email_address': 'email',
  'email address': 'email',
  'e-mail': 'email',
  'company': 'company',
  'organization': 'company',
  'org': 'company',
  'company_name': 'company',
  'company name': 'company',
  'address': 'address',
  'street_address': 'address',
  'street address': 'address',
  'location': 'address',
  'notes': 'notes',
  'note': 'notes',
  'description': 'notes',
  'comments': 'notes',
  'categories': 'categories',
  'category': 'categories',
  'tags': 'categories',
  'groups': 'categories',
  'all_phones': 'all_phones',
  'all phones': 'all_phones',
  'other_phones': 'all_phones',
  'all_emails': 'all_emails',
  'all emails': 'all_emails',
  'other_emails': 'all_emails',
};

const normalizeHeader = (header: string): string => {
  const normalized = header.trim().toLowerCase();
  return columnMappings[normalized] || normalized;
};

export const csvUtils = {
  // Export contacts to CSV
  exportToCSV(contacts: Contact[]): string {
    const rows = contacts.map((contact) => {
      const primaryPhone = contact.phones?.find((p) => p.is_primary) || contact.phones?.[0];
      const primaryEmail = contact.emails?.find((e) => e.is_primary) || contact.emails?.[0];
      const allPhones = contact.phones?.map((p) => p.phone_number).join('; ') || '';
      const allEmails = contact.emails?.map((e) => e.email).join('; ') || '';

      return {
        name: contact.name,
        phone: primaryPhone?.phone_number || '',
        'all_phones': allPhones,
        email: primaryEmail?.email || '',
        'all_emails': allEmails,
        company: contact.company || '',
        designation: contact.designation?.name || '',
        address: contact.address || '',
        notes: contact.notes || '',
        categories: contact.categories?.join('; ') || '',
        last_visit: contact.last_visit || '',
      };
    });

    return Papa.unparse(rows);
  },

  // Import CSV to contacts
  importFromCSV(csvText: string): Contact[] {
    const result = Papa.parse<CSVImportRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
    });

    if (result.errors.length > 0) {
      console.warn('CSV parsing errors:', result.errors);
    }

    return result.data
      .filter((row) => row.name) // Only rows with names
      .map((row) => {
        const contact: Contact = {
          name: row.name.trim(),
          company: row.company?.trim() || undefined,
          address: row.address?.trim() || undefined,
          notes: row.notes?.trim() || undefined,
          categories: [],
          phones: [],
          emails: [],
          local_updated_at: new Date().toISOString(),
        };

        // Parse phones
        if (row.phone) {
          const phoneNumbers = row.phone.split(';').map((p) => p.trim()).filter(Boolean);
          contact.phones = phoneNumbers.map((phone, index) => ({
            phone_number: phone,
            normalized_phone: phoneUtils.normalize(phone),
            label: 'mobile',
            is_primary: index === 0,
          }));
        }

        if (row.all_phones) {
          const phoneNumbers = row.all_phones.split(';').map((p) => p.trim()).filter(Boolean);
          contact.phones = [
            ...contact.phones,
            ...phoneNumbers.map((phone, index) => ({
              phone_number: phone,
              normalized_phone: phoneUtils.normalize(phone),
              label: 'mobile',
              is_primary: index === 0 && contact.phones.length === 0,
            })),
          ];
        }

        // Parse emails
        if (row.email) {
          const emails = row.email.split(';').map((e) => e.trim()).filter(Boolean);
          contact.emails = emails.map((email, index) => ({
            email,
            label: 'work',
            is_primary: index === 0,
          }));
        }

        if (row.all_emails) {
          const emails = row.all_emails.split(';').map((e) => e.trim()).filter(Boolean);
          contact.emails = [
            ...contact.emails,
            ...emails.map((email, index) => ({
              email,
              label: 'work',
              is_primary: index === 0 && contact.emails.length === 0,
            })),
          ];
        }

        // Parse categories
        if (row.categories) {
          contact.categories = row.categories.split(';').map((c) => c.trim()).filter(Boolean);
        }

        return contact;
      });
  },

  // Generate CSV preview
  previewCSV(csvText: string, limit = 10): CSVImportRow[] {
    const result = Papa.parse<CSVImportRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      preview: limit,
    });

    return result.data;
  },
};

