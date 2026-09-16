import { api } from '@renderer/lib/api';
import type { UseGamesResult } from '@renderer/types/use-games.type';
import type { Game, GameInput } from '@shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const GAMES_KEY = ['games'] as const;

export function useGames(): UseGamesResult {
  const queryClient = useQueryClient();

  const { data: games = [], isLoading } = useQuery({
    queryKey: GAMES_KEY,
    queryFn: () => api.games.list(),
  });

  const addMutation = useMutation({
    mutationFn: (input: GameInput) => api.games.add(input),
    onSuccess: (game) => {
      queryClient.setQueryData<Game[]>(GAMES_KEY, (prev) => [...(prev ?? []), game]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<GameInput> }) => api.games.update(id, patch),
    onSuccess: (updated) => {
      queryClient.setQueryData<Game[]>(GAMES_KEY, (prev) => (prev ?? []).map((g) => (g.id === updated.id ? updated : g)));
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => api.games.remove(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Game[]>(GAMES_KEY, (prev) => (prev ?? []).filter((g) => g.id !== id));
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
