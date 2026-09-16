import { queryOptions } from '@tanstack/react-query';

import { backupApi } from './api';

export const backupVersionsKeys = {
  all: (gameId: string) => ['backupVersions', gameId] as const,
};

export const backupVersionsQueries = {
  byGame: (gameId: string, enabled: boolean) =>
    queryOptions({
      queryKey: backupVersionsKeys.all(gameId),
      queryFn: () => backupApi.listVersions(gameId),
      enabled,
      staleTime: 0,
      refetchOnMount: 'always',
    }),
};
