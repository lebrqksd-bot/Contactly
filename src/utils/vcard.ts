import { Contact } from '@/types';

export const vcardUtils = {
  // Generate vCard string
  generate(contact: Contact): string {
    let vcard = 'BEGIN:VCARD\n';
    vcard += 'VERSION:3.0\n';
    vcard += `FN:${this.escape(contact.name)}\n`;
    vcard += `N:${this.escape(contact.name)};;;;\n`;

    // Organization
    if (contact.company) {
      vcard += `ORG:${this.escape(contact.company)}\n`;
    }

    // Title
    if (contact.designation?.name) {
      vcard += `TITLE:${this.escape(contact.designation.name)}\n`;
    }

    // Phones
    contact.phones?.forEach((phone) => {
      vcard += `TEL;TYPE=${phone.label.toUpperCase()}:${phone.phone_number}\n`;
    });

    // Emails
    contact.emails?.forEach((email) => {
      vcard += `EMAIL;TYPE=${email.label.toUpperCase()}:${email.email}\n`;
    });

    // Address
    if (contact.address) {
      vcard += `ADR;TYPE=WORK:;;${this.escape(contact.address)};;;;\n`;
    }

    // Notes
    if (contact.notes) {
      vcard += `NOTE:${this.escape(contact.notes)}\n`;
    }

    // Photo (if URL)
    if (contact.profile_image_url) {
      vcard += `PHOTO;VALUE=URI:${contact.profile_image_url}\n`;
    }

    vcard += 'END:VCARD\n';
    return vcard;
  },

  // Escape special characters
  escape(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
      .replace(/\n/g, '\\n');
  },

  // Generate vCard for multiple contacts
  generateMultiple(contacts: Contact[]): string {
    return contacts.map((contact) => this.generate(contact)).join('\n');
  },
};

