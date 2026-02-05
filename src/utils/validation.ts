import { z } from 'zod';
import { Contact, ContactPhone, ContactEmail } from '@/types';

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().optional(),
  designation_id: z.string().optional(),
  profile_image_url: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
  address: z.string().optional(),
  last_visit: z.string().optional(),
  categories: z.array(z.string()).default([]),
  phones: z.array(
    z.object({
      phone_number: z.string().optional().or(z.literal('')),
      normalized_phone: z.string().optional(),
      label: z.string().default('mobile'),
      is_primary: z.boolean().default(false),
    })
  ).min(0),
  emails: z.array(
    z.object({
      email: z.string().email('Invalid email address').optional().or(z.literal('')),
      label: z.string().default('work'),
      is_primary: z.boolean().default(false),
    })
  ).min(0),
});

export const validateContact = (contact: Partial<Contact>): { valid: boolean; errors: Record<string, string> } => {
  try {
    contactSchema.parse(contact);
    return { valid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { valid: false, errors };
    }
    return { valid: false, errors: { general: 'Validation failed' } };
  }
};

