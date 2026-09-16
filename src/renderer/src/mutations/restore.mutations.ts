import { api } from '@renderer/lib/api';
import { queryKeys } from '@renderer/lib/queryKeys';
import type { RestoreOptions } from '@shared/types';
import { mutationOptions } from '@tanstack/react-query';

export const restoreMutations = {
  run: (gameId: string) =>
    mutationOptions({
      mutationKey: queryKeys.restore.run(gameId),
      mutationFn: ({ versionId, options }: { versionId: string; options: RestoreOptions }) => api.restore.run(gameId, versionId, options),
      meta: { invalidateQueries: queryKeys.games.all() },
    }),
};
