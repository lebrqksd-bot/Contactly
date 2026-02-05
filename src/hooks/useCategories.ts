import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Category } from '@/types';
import { categoriesService } from '@/services/categories';

export const useCategories = () => {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, error } = useQuery<Category[]>(
    ['categories'],
    () => categoriesService.getAll(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const createMutation = useMutation(
    (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) =>
      categoriesService.create(category),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['categories']);
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, updates }: { id: string; updates: Partial<Category> }) =>
      categoriesService.update(id, updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['categories']);
      },
    }
  );

  const deleteMutation = useMutation(
    (id: string) => categoriesService.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['categories']);
      },
    }
  );

  return {
    categories,
    isLoading,
    error,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
  };
};

