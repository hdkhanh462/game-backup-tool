import { api } from '@renderer/lib/api';
import { queryKeys } from '@renderer/lib/queryKeys';
import { mutationOptions } from '@tanstack/react-query';

export const backupVersionsMutations = {
  delete: (gameId: string) =>
    mutationOptions({
      mutationKey: queryKeys.backupVersions.delete(gameId),
      mutationFn: (versionId: string) => api.backup.deleteVersion(gameId, versionId),
      meta: { invalidateQueries: queryKeys.backupVersions.all(gameId) },
    }),
};
