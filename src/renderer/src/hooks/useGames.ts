import { queryKeys } from '@renderer/lib/queryKeys';
import { gamesMutations } from '@renderer/mutations/games.mutations';
import { gamesQueries } from '@renderer/queries/games.queries';
import type { UseGamesResult } from '@renderer/types/use-games.type';
import type { Game } from '@shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useGames(): UseGamesResult {
  const queryClient = useQueryClient();

  const { data: games = [], isLoading } = useQuery(gamesQueries.list());

  const addMutation = useMutation({
    ...gamesMutations.add(),
    onSuccess: (game) => {
      queryClient.setQueryData<Game[]>(queryKeys.games.all(), (prev) => [...(prev ?? []), game]);
    },
  });

  const updateMutation = useMutation({
    ...gamesMutations.update(),
    onSuccess: (updated) => {
      queryClient.setQueryData<Game[]>(queryKeys.games.all(), (prev) => (prev ?? []).map((g) => (g.id === updated.id ? updated : g)));
    },
  });

  const removeMutation = useMutation({
    ...gamesMutations.remove(),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Game[]>(queryKeys.games.all(), (prev) => (prev ?? []).filter((g) => g.id !== id));
    },
  });

  return {
    games,
    isLoading,
    addGame: (input) => addMutation.mutateAsync(input),
    updateGame: (id, patch) => updateMutation.mutateAsync({ id, patch }),
    removeGame: (id) => removeMutation.mutateAsync(id),
  };
}
