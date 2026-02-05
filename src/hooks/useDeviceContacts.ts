import { useState } from 'react';
import { deviceContactsService } from '@/services/deviceContacts';
import { Contact } from '@/types';
import { contactRepository } from '@/db/contacts';
import { useAuth } from '@/context/AuthContext';

export const useDeviceContacts = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [syncedCount, setSyncedCount] = useState(0);

  const syncDeviceContacts = async () => {
    if (!user?.id) {
      throw new Error('Not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const deviceContacts = await deviceContactsService.getAll();
      let count = 0;

      for (const deviceContact of deviceContacts) {
        try {
          // Check if contact already exists by phone number
          const existingContacts = await contactRepository.getAll(user.id);
          const normalizedPhones = deviceContact.phones?.map(
            (p) => p.normalized_phone || p.phone_number
          ) || [];

          const exists = existingContacts.some((existing) =>
            existing.phones?.some((p) =>
              normalizedPhones.includes(p.normalized_phone || p.phone_number)
            )
          );

          if (!exists) {
            await contactRepository.create({
              ...deviceContact,
              user_id: user.id,
            });
            count++;
          }
        } catch (err) {
          console.error('Error syncing contact:', err);
        }
      }

      setSyncedCount(count);
      return { synced: count, total: deviceContacts.length };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    syncDeviceContacts,
    isLoading,
    error,
    syncedCount,
  };
};

