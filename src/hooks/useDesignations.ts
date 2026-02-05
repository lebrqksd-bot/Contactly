import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Designation } from '@/types';
import { designationRepository } from '@/db/designations';
import { useAuth } from '@/context/AuthContext';

export const useDesignations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: designations = [], isLoading, error, refetch } = useQuery<Designation[]>(
    ['designations', user?.id],
    async () => {
      if (!user?.id) return [];
      return await designationRepository.getAll(user.id);
    },
    {
      enabled: !!user?.id,
      staleTime: 60000, // 1 minute
    }
  );

  const createMutation = useMutation(
    async (designation: Omit<Designation, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('Not authenticated');
      return await designationRepository.create({
        ...designation,
        created_by: user.id,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['designations', user?.id]);
      },
    }
  );

  const updateMutation = useMutation(
    async (designation: Designation) => {
      if (!designation.id) throw new Error('Designation ID is required');
      return await designationRepository.update(designation);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['designations', user?.id]);
      },
    }
  );

  const deleteMutation = useMutation(
    async (id: string) => {
      await designationRepository.delete(id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['designations', user?.id]);
      },
    }
  );

  return {
    designations,
    isLoading,
    error,
    refetch,
    createDesignation: createMutation.mutateAsync,
    updateDesignation: updateMutation.mutateAsync,
    deleteDesignation: deleteMutation.mutateAsync,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
  };
};

