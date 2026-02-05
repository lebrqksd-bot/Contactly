// Simple QR code generator using a web API
// For production, consider using react-native-qrcode-svg or similar

export const qrcodeUtils = {
  // Generate QR code data URL using a web API
  generateQRCodeURL(data: string): string {
    // Using a free QR code API
    // For production, use a proper QR code library
    const encodedData = encodeURIComponent(data);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}`;
  },

  // Generate QR code for contact vCard
  generateContactQRCode(contact: any): string {
    const vcard = this.generateVCard(contact);
    return this.generateQRCodeURL(vcard);
  },

  // Simple vCard generator
  generateVCard(contact: any): string {
    let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
    vcard += `FN:${this.escape(contact.name)}\n`;
    vcard += `N:${this.escape(contact.name)};;;;\n`;

    if (contact.company) {
      vcard += `ORG:${this.escape(contact.company)}\n`;
    }

    contact.phones?.forEach((phone: any) => {
      vcard += `TEL;TYPE=${phone.label.toUpperCase()}:${phone.phone_number}\n`;
    });

    contact.emails?.forEach((email: any) => {
      vcard += `EMAIL;TYPE=${email.label.toUpperCase()}:${email.email}\n`;
    });

    if (contact.address) {
      vcard += `ADR;TYPE=WORK:;;${this.escape(contact.address)};;;;\n`;
    }

    if (contact.website) {
      vcard += `URL:${contact.website}\n`;
    }

    vcard += 'END:VCARD\n';
    return vcard;
  },

  escape(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
      .replace(/\n/g, '\\n');
  },
};

