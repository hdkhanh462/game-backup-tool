import { toast } from '@renderer/components/ui/toast';
import { queryOptions } from '@tanstack/react-query';

import { authApi } from './api';

export const authKeys = {
  status: () => ['auth', 'status'] as const,
};

export const authQueries = {
  status: () =>
    queryOptions({
      queryKey: authKeys.status(),
      queryFn: async () => {
        const next = await authApi.getStatus();
        if (next.state === 'error' && next.error) {
          toast.add({ title: 'Google Drive connection error', description: next.error, type: 'error' });
        }
        return next;
      },
    }),
};
