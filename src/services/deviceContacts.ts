import * as Contacts from 'expo-contacts';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import { Contact, ContactPhone } from '@/types';

export const deviceContactsService = {
  // Request contacts permission
  async requestPermission(): Promise<boolean> {
    const { status } = await Contacts.requestPermissionsAsync();
    return status === 'granted';
  },

  // Get all device contacts
  async getAll(): Promise<Contact[]> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      throw new Error('Permission to access contacts is required');
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.Name,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Emails,
        Contacts.Fields.Company,
        Contacts.Fields.JobTitle,
        Contacts.Fields.Addresses,
        Contacts.Fields.Note,
        Contacts.Fields.Image,
      ],
    });

    return data.map((deviceContact) => this.normalizeContact(deviceContact));
  },

  // Normalize device contact to app contact format
  normalizeContact(deviceContact: Contacts.Contact): Contact {
    const phones: ContactPhone[] = (deviceContact.phoneNumbers || []).map((phone, index) => {
      let normalized = phone.number;
      try {
        if (isValidPhoneNumber(phone.number)) {
          const parsed = parsePhoneNumber(phone.number);
          normalized = parsed.format('E.164');
        }
      } catch (error) {
        // Keep original if parsing fails
        normalized = phone.number;
      }

      return {
        phone_number: phone.number,
        normalized_phone: normalized,
        label: phone.label || 'mobile',
        is_primary: index === 0,
      };
    });

    const emails = (deviceContact.emails || []).map((email, index) => ({
      email: email.email,
      label: email.label || 'work',
      is_primary: index === 0,
    }));

    return {
      name: deviceContact.name || 'Unknown',
      company: deviceContact.company || undefined,
      phones,
      emails,
      address: deviceContact.addresses?.[0]
        ? `${deviceContact.addresses[0].street || ''}, ${deviceContact.addresses[0].city || ''}, ${deviceContact.addresses[0].region || ''}`
        : undefined,
      notes: deviceContact.note || undefined,
      profile_image_url: deviceContact.imageUri || undefined,
      categories: [],
      local_updated_at: new Date().toISOString(),
    };
  },
};

