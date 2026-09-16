import { queryClient } from '@renderer/lib/queryClient';
import type { Game, GameInput } from '@shared/types';
import { mutationOptions } from '@tanstack/react-query';

import { gamesApi } from './api';
import { gamesKeys } from './queries';

export const gamesMutations = {
  add: () =>
    mutationOptions({
      mutationKey: ['games', 'add'],
      mutationFn: (input: GameInput) => gamesApi.add(input),
      onSuccess: (game) => {
        queryClient.setQueryData<Game[]>(gamesKeys.all(), (prev) => [...(prev ?? []), game]);
      },
    }),
  update: () =>
    mutationOptions({
      mutationKey: ['games', 'update'],
      mutationFn: ({ id, patch }: { id: string; patch: Partial<GameInput> }) => gamesApi.update(id, patch),
      onSuccess: (updated) => {
        queryClient.setQueryData<Game[]>(gamesKeys.all(), (prev) => (prev ?? []).map((g) => (g.id === updated.id ? updated : g)));
      },
    }),
  remove: () =>
    mutationOptions({
      mutationKey: ['games', 'remove'],
      mutationFn: (id: string) => gamesApi.remove(id),
      onSuccess: (_data, id) => {
        queryClient.setQueryData<Game[]>(gamesKeys.all(), (prev) => (prev ?? []).filter((g) => g.id !== id));
      },
    }),
};
