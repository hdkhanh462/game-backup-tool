import { queryClient } from '@renderer/lib/queryClient';
import type { Game, GameInput } from '@shared/types';
import type { UseMutationOptions } from '@tanstack/react-query';

import { gamesApi } from './api';
import { gamesKeys } from './queries';

export const gamesMutations = {
  add: (): UseMutationOptions<Game, Error, GameInput> => ({
    mutationFn: (input) => gamesApi.add(input),
    onSuccess: (game) => {
      queryClient.setQueryData<Game[]>(gamesKeys.all, (prev) => [...(prev ?? []), game]);
    },
  }),
  update: (): UseMutationOptions<Game, Error, { id: string; patch: Partial<GameInput> }> => ({
    mutationFn: ({ id, patch }) => gamesApi.update(id, patch),
    onSuccess: (updated) => {
      queryClient.setQueryData<Game[]>(gamesKeys.all, (prev) => (prev ?? []).map((g) => (g.id === updated.id ? updated : g)));
    },
  }),
  remove: (): UseMutationOptions<void, Error, string> => ({
    mutationFn: (id) => gamesApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Game[]>(gamesKeys.all, (prev) => (prev ?? []).filter((g) => g.id !== id));
    },
  }),
};
