// Web mock for expo-contacts
export const requestPermissionsAsync = async () => ({ status: 'denied' });
export const getContactsAsync = async () => ({ data: [] });
export const Fields = {
  Name: 'name',
  PhoneNumbers: 'phoneNumbers',
  Emails: 'emails',
  Company: 'company',
  JobTitle: 'jobTitle',
  Addresses: 'addresses',
  Note: 'note',
  Image: 'image',
};

export default {
  requestPermissionsAsync,
  getContactsAsync,
  Fields,
};

