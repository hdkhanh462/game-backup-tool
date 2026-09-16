import { api } from '@renderer/lib/api';
import { queryKeys } from '@renderer/lib/queryKeys';
import type { GameInput } from '@shared/types';
import { mutationOptions } from '@tanstack/react-query';

export const gamesMutations = {
  add: () =>
    mutationOptions({
      mutationKey: queryKeys.games.add(),
      mutationFn: (input: GameInput) => api.games.add(input),
    }),
  update: () =>
    mutationOptions({
      mutationKey: queryKeys.games.update(),
      mutationFn: ({ id, patch }: { id: string; patch: Partial<GameInput> }) => api.games.update(id, patch),
    }),
  remove: () =>
    mutationOptions({
      mutationKey: queryKeys.games.remove(),
      mutationFn: (id: string) => api.games.remove(id),
    }),
};
