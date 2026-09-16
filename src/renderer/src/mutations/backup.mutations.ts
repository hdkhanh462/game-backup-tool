import { api } from '@renderer/lib/api';
import { queryKeys } from '@renderer/lib/queryKeys';
import { mutationOptions } from '@tanstack/react-query';

export const backupMutations = {
  run: (gameId: string) =>
    mutationOptions({
      mutationKey: queryKeys.backup.run(gameId),
      mutationFn: () => api.backup.run(gameId),
      meta: { invalidateQueriesMultiple: [queryKeys.games.all(), queryKeys.backupVersions.all(gameId)] },
    }),
};
