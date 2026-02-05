import { parsePhoneNumber, isValidPhoneNumber, formatIncompletePhoneNumber } from 'libphonenumber-js';

export const phoneUtils = {
  // Normalize phone number
  normalize(phone: string, defaultCountry = 'US'): string {
    try {
      if (isValidPhoneNumber(phone, defaultCountry)) {
        const parsed = parsePhoneNumber(phone, defaultCountry);
        return parsed.format('E.164');
      }
      return phone;
    } catch (error) {
      return phone;
    }
  },

  // Format phone number for display
  format(phone: string, defaultCountry = 'US'): string {
    try {
      if (isValidPhoneNumber(phone, defaultCountry)) {
        const parsed = parsePhoneNumber(phone, defaultCountry);
        return parsed.formatInternational();
      }
      return formatIncompletePhoneNumber(phone, defaultCountry);
    } catch (error) {
      return phone;
    }
  },

  // Validate phone number
  isValid(phone: string, defaultCountry = 'US'): boolean {
    return isValidPhoneNumber(phone, defaultCountry);
  },

  // Extract country code
  getCountryCode(phone: string, defaultCountry = 'US'): string | undefined {
    try {
      if (isValidPhoneNumber(phone, defaultCountry)) {
        const parsed = parsePhoneNumber(phone, defaultCountry);
        return parsed.country || undefined;
      }
    } catch (error) {
      // Ignore
    }
    return undefined;
  },
};

