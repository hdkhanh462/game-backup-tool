import { api } from '@renderer/lib/api';
import { queryKeys } from '@renderer/lib/queryKeys';
import { queryOptions } from '@tanstack/react-query';

export const backupVersionsQueries = {
  byGame: (gameId: string) =>
    queryOptions({
      queryKey: queryKeys.backupVersions.all(gameId),
      queryFn: () => api.backup.listVersions(gameId),
      staleTime: 0,
      refetchOnMount: 'always',
    }),
};
