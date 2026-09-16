import { MutationCache, QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSettled: (_data, _error, _variables, _context, mutation) => {
      const { meta } = mutation;
      if (!meta) return;

      if (meta.invalidateQueries) {
        queryClient.invalidateQueries({ queryKey: meta.invalidateQueries });
      }

      if (meta.invalidateQueriesMultiple) {
        for (const queryKey of meta.invalidateQueriesMultiple) {
          queryClient.invalidateQueries({ queryKey });
        }
      }
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});
