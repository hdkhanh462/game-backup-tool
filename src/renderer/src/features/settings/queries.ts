import { queryOptions } from '@tanstack/react-query';

import { settingsApi } from './api';

export const settingsKeys = {
  all: () => ['settings'] as const,
};

export const settingsQueries = {
  all: () =>
    queryOptions({
      queryKey: settingsKeys.all(),
      queryFn: () => settingsApi.get(),
    }),
};
