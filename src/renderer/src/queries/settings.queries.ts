import { api } from '@renderer/lib/api';
import { queryKeys } from '@renderer/lib/queryKeys';
import { queryOptions } from '@tanstack/react-query';

export const settingsQueries = {
  all: () =>
    queryOptions({
      queryKey: queryKeys.settings.all(),
      queryFn: () => api.settings.get(),
    }),
};
