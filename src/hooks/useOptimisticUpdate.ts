import { useQueryClient } from 'react-query';
import { useCallback } from 'react';

export const useOptimisticUpdate = <T>(
  queryKey: string[],
  updater: (old: T[] | undefined) => T[]
) => {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.setQueryData<T[]>(queryKey, updater);
  }, [queryClient, queryKey, updater]);
};

