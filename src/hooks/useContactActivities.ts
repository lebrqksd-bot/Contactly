import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ContactActivity } from '@/types';
import { activitiesService } from '@/services/activities';

export const useContactActivities = (contactId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading, error } = useQuery<ContactActivity[]>(
    ['contact-activities', contactId],
    () => {
      if (!contactId) return Promise.resolve([]);
      return activitiesService.getByContactId(contactId);
    },
    {
      enabled: !!contactId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  const { data: stats } = useQuery(
    ['contact-stats', contactId],
    () => {
      if (!contactId) return null;
      return activitiesService.getStats(contactId);
    },
    {
      enabled: !!contactId,
      staleTime: 2 * 60 * 1000,
    }
  );

  const createMutation = useMutation(
    (activity: Omit<ContactActivity, 'id' | 'created_at'>) =>
      activitiesService.create(activity),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['contact-activities', contactId]);
        queryClient.invalidateQueries(['contact-stats', contactId]);
      },
    }
  );

  return {
    activities,
    stats,
    isLoading,
    error,
    createActivity: createMutation.mutateAsync,
    isCreating: createMutation.isLoading,
  };
};

