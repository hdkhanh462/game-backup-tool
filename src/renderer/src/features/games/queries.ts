import { queryOptions } from '@tanstack/react-query';

import { gamesApi } from './api';

export const gamesKeys = {
  all: ['games'] as const,
  importCandidates: ['games', 'importCandidates'] as const,
};

export const gamesQueries = {
  list: () =>
    queryOptions({
      queryKey: gamesKeys.all,
      queryFn: () => gamesApi.list(),
    }),
  importCandidates: (enabled: boolean) =>
    queryOptions({
      queryKey: gamesKeys.importCandidates,
      queryFn: () => gamesApi.listImportCandidates(),
      enabled,
      staleTime: 0,
    }),
};
