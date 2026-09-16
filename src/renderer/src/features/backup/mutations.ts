import { gamesKeys } from '@renderer/features/games/queries';
import { queryClient } from '@renderer/lib/queryClient';
import type { BackupRunResult, BackupVersion } from '@shared/types';
import type { UseMutationOptions } from '@tanstack/react-query';

import { backupApi, restoreApi } from './api';
import { backupVersionsKeys } from './queries';
import type { RestoreVersionInput } from './types';

export const backupMutations = {
  run: (gameId: string): UseMutationOptions<BackupRunResult, Error, void> => ({
    mutationFn: () => backupApi.run(gameId),
    meta: { invalidateQueriesMultiple: [gamesKeys.all, backupVersionsKeys.all(gameId)] },
  }),
};

export const restoreMutations = {
  run: (gameId: string): UseMutationOptions<void, Error, RestoreVersionInput> => ({
    mutationFn: ({ versionId, options }) => restoreApi.run(gameId, versionId, options),
    meta: { invalidateQueries: gamesKeys.all },
  }),
};

export const backupVersionsMutations = {
  delete: (gameId: string): UseMutationOptions<void, Error, string> => ({
    mutationFn: (versionId) => backupApi.deleteVersion(gameId, versionId),
    onSuccess: (_data, versionId) => {
      queryClient.setQueryData<BackupVersion[]>(backupVersionsKeys.all(gameId), (prev) => (prev ?? []).filter((v) => v.id !== versionId));
    },
    meta: { invalidateQueries: backupVersionsKeys.all(gameId) },
  }),
};
