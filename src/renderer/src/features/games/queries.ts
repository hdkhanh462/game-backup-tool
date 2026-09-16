import { queryOptions } from '@tanstack/react-query';

import { gamesApi } from './api';

export const gamesKeys = {
  all: ['games'] as const,
};

export const gamesQueries = {
  list: () =>
    queryOptions({
      queryKey: gamesKeys.all,
      queryFn: () => gamesApi.list(),
    }),
};
