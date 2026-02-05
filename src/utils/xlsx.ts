import * as XLSX from 'xlsx';
import { Contact, ContactPhone, ContactEmail } from '@/types';
import { phoneUtils } from './phone';

export const xlsxUtils = {
  // Export contacts to XLSX
  exportToXLSX(contacts: Contact[]): XLSX.WorkBook {
    const rows = contacts.map((contact) => {
      const primaryPhone = contact.phones?.find((p) => p.is_primary) || contact.phones?.[0];
      const primaryEmail = contact.emails?.find((e) => e.is_primary) || contact.emails?.[0];
      const allPhones = contact.phones?.map((p) => p.phone_number).join('; ') || '';
      const allEmails = contact.emails?.map((e) => e.email).join('; ') || '';

      return {
        Name: contact.name,
        Phone: primaryPhone?.phone_number || '',
        'All Phones': allPhones,
        Email: primaryEmail?.email || '',
        'All Emails': allEmails,
        Company: contact.company || '',
        Designation: contact.designation?.name || '',
        Address: contact.address || '',
        Website: contact.website || '',
        Birthday: contact.birthday || '',
        Notes: contact.notes || '',
        Categories: contact.categories?.join('; ') || '',
        Tags: contact.tags?.join('; ') || '',
        'Last Visit': contact.last_visit || '',
        'Created At': contact.created_at || '',
        'Updated At': contact.updated_at || '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');

    // Auto-size columns
    const maxWidth = 50;
    const wscols = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.min(
        Math.max(key.length, ...rows.map((row) => String(row[key as keyof typeof row] || '').length)),
        maxWidth
      ),
    }));
    worksheet['!cols'] = wscols;

    return workbook;
  },

  // Import XLSX to contacts
  importFromXLSX(buffer: ArrayBuffer): Contact[] {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

    return rows
      .filter((row) => row.Name || row.name) // Only rows with names
      .map((row) => {
        const name = row.Name || row.name || row.NAME || '';
        const contact: Contact = {
          name: String(name).trim(),
          company: row.Company || row.company || row.COMPANY || undefined,
          address: row.Address || row.address || row.ADDRESS || undefined,
          website: row.Website || row.website || row.WEBSITE || undefined,
          birthday: row.Birthday || row.birthday || row.BIRTHDAY || undefined,
          notes: row.Notes || row.notes || row.NOTES || undefined,
          categories: [],
          tags: [],
          phones: [],
          emails: [],
          local_updated_at: new Date().toISOString(),
        };

        // Parse phones
        const phoneField = row.Phone || row.phone || row.PHONE || '';
        const allPhonesField = row['All Phones'] || row['all phones'] || row['ALL PHONES'] || '';
        const phones = [phoneField, allPhonesField]
          .filter(Boolean)
          .flatMap((p) => String(p).split(';').map((p) => p.trim()).filter(Boolean));

        if (phones.length > 0) {
          contact.phones = phones.map((phone, index) => ({
            phone_number: phone,
            normalized_phone: phoneUtils.normalize(phone),
            label: 'mobile',
            is_primary: index === 0,
          }));
        }

        // Parse emails
        const emailField = row.Email || row.email || row.EMAIL || '';
        const allEmailsField = row['All Emails'] || row['all emails'] || row['ALL EMAILS'] || '';
        const emails = [emailField, allEmailsField]
          .filter(Boolean)
          .flatMap((e) => String(e).split(';').map((e) => e.trim()).filter(Boolean));

        if (emails.length > 0) {
          contact.emails = emails.map((email, index) => ({
            email,
            label: 'work',
            is_primary: index === 0,
          }));
        }

        // Parse categories
        const categoriesField = row.Categories || row.categories || row.CATEGORIES || '';
        if (categoriesField) {
          contact.categories = String(categoriesField)
            .split(';')
            .map((c) => c.trim())
            .filter(Boolean);
        }

        // Parse tags
        const tagsField = row.Tags || row.tags || row.TAGS || '';
        if (tagsField) {
          contact.tags = String(tagsField)
            .split(';')
            .map((t) => t.trim())
            .filter(Boolean);
        }

        return contact;
      });
  },
};

