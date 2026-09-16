import { gamesKeys } from '@renderer/features/games/queries';
import { queryClient } from '@renderer/lib/queryClient';
import type { RestoreOptions } from '@shared/types';
import { mutationOptions } from '@tanstack/react-query';

import { backupApi, restoreApi } from './api';
import { backupVersionsKeys } from './queries';

export const backupMutations = {
  run: (gameId: string) =>
    mutationOptions({
      mutationKey: ['backup', 'run', gameId],
      mutationFn: () => backupApi.run(gameId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: gamesKeys.all() });
        queryClient.invalidateQueries({ queryKey: backupVersionsKeys.all(gameId) });
      },
    }),
};

export const restoreMutations = {
  run: (gameId: string) =>
    mutationOptions({
      mutationKey: ['restore', 'run', gameId],
      mutationFn: ({ versionId, options }: { versionId: string; options: RestoreOptions }) => restoreApi.run(gameId, versionId, options),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: gamesKeys.all() });
      },
    }),
};

export const backupVersionsMutations = {
  delete: (gameId: string) =>
    mutationOptions({
      mutationKey: ['backupVersions', gameId, 'delete'],
      mutationFn: (versionId: string) => backupApi.deleteVersion(gameId, versionId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: backupVersionsKeys.all(gameId) });
      },
    }),
};
