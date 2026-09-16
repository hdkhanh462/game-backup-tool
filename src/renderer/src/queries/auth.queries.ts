import { api } from '@renderer/lib/api';
import { queryKeys } from '@renderer/lib/queryKeys';
import { queryOptions } from '@tanstack/react-query';

export const authQueries = {
  status: () =>
    queryOptions({
      queryKey: queryKeys.auth.status(),
      queryFn: () => api.auth.getStatus(),
    }),
};
