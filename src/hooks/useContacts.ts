import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useMemo } from 'react';
import { Contact, ContactFilter } from '@/types';
import { contactRepository } from '@/db/contacts';
import { contactsService } from '@/services/contacts';
import { useAuth } from '@/context/AuthContext';
import { phoneUtils } from '@/utils/phone';

export const useContacts = (filter?: ContactFilter) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Create a stable query key by stringifying the filter
  const filterKey = useMemo(() => {
    return JSON.stringify(filter || { type: 'all' });
  }, [filter]);

  const { data: contacts = [], isLoading, error, refetch, isRefetching } = useQuery<Contact[]>(
    ['contacts', user?.id, filterKey],
    async () => {
      if (!user?.id) return [];

      // On web, use Supabase directly; on native, use local SQLite
      let allContacts: Contact[] = [];
      try {
        if (typeof window !== 'undefined') {
          // Web: Use Supabase service
          allContacts = await contactsService.getAll(user.id);
        } else {
          // Native: Use local SQLite
          allContacts = await contactRepository.getAll(user.id);
        }
      } catch (err) {
        console.error('Error loading contacts:', err);
        // Fallback to empty array
        allContacts = [];
      }

      // Apply filters
      if (filter) {
        if (filter.search) {
          // Search in loaded contacts
          const searchLower = filter.search.toLowerCase();
          allContacts = allContacts.filter((c) => {
            const nameMatch = c.name?.toLowerCase().includes(searchLower);
            const companyMatch = c.company?.toLowerCase().includes(searchLower);
            const phoneMatch = c.phones?.some(p => 
              p.phone_number?.toLowerCase().includes(searchLower)
            );
            const emailMatch = c.emails?.some(e => 
              e.email?.toLowerCase().includes(searchLower)
            );
            const websiteMatch = c.website?.toLowerCase().includes(searchLower);
            const tagsMatch = c.tags?.some(tag => 
              tag.toLowerCase().includes(searchLower)
            );
            return nameMatch || companyMatch || phoneMatch || emailMatch || websiteMatch || tagsMatch;
          });
        }

        if (filter.type === 'recent') {
          allContacts = allContacts
            .filter((c) => c.last_visit)
            .sort((a, b) => {
              const dateA = new Date(a.last_visit || 0).getTime();
              const dateB = new Date(b.last_visit || 0).getTime();
              return dateB - dateA;
            });
        } else if (filter.type === 'company') {
          allContacts = allContacts.filter((c) => c.company);
        } else if (filter.type === 'staff') {
          allContacts = allContacts.filter((c) => c.designation_id);
        }

        if (filter.category) {
          allContacts = allContacts.filter((c) =>
            c.categories?.includes(filter.category!)
          );
        }
      }

      return allContacts;
    },
    {
      enabled: !!user?.id,
      staleTime: 30000, // 30 seconds
    }
  );

  const createMutation = useMutation(
    async (contact: Contact) => {
      if (!user?.id) throw new Error('Not authenticated');
      // On web, use Supabase; on native, use SQLite
      if (typeof window !== 'undefined') {
        return await contactsService.create({
          ...contact,
          user_id: user.id,
        });
      } else {
        return await contactRepository.create({
          ...contact,
          user_id: user.id,
        });
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['contacts', user?.id]);
      },
    }
  );

  const updateMutation = useMutation(
    async (contact: Contact) => {
      if (!contact.id) throw new Error('Contact ID is required');
      // On web, use Supabase; on native, use SQLite
      if (typeof window !== 'undefined') {
        return await contactsService.update(contact.id, contact);
      } else {
        return await contactRepository.update(contact);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['contacts', user?.id]);
      },
    }
  );

  const deleteMutation = useMutation(
    async (id: string) => {
      // On web, use Supabase; on native, use SQLite
      if (typeof window !== 'undefined') {
        await contactsService.delete(id);
      } else {
        await contactRepository.delete(id);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['contacts', user?.id]);
      },
    }
  );

  return {
    contacts,
    isLoading,
    error,
    refetch,
    isRefetching,
    createContact: createMutation.mutateAsync,
    updateContact: updateMutation.mutateAsync,
    deleteContact: deleteMutation.mutateAsync,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
  };
};

