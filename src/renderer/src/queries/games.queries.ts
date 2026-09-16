import { api } from '@renderer/lib/api';
import { queryKeys } from '@renderer/lib/queryKeys';
import { queryOptions } from '@tanstack/react-query';

export const gamesQueries = {
  list: () =>
    queryOptions({
      queryKey: queryKeys.games.all(),
      queryFn: () => api.games.list(),
    }),
};
