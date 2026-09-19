import { useMutation, useQuery } from '@tanstack/react-query';

import { gamesMutations } from '../mutations';
import { gamesQueries } from '../queries';
import type { UseGamesResult } from '../types';

export function useGames(): UseGamesResult {
  const { data: games = [], isLoading } = useQuery(gamesQueries.list());
  const addMutation = useMutation(gamesMutations.add());
  const importMutation = useMutation(gamesMutations.import());
  const updateMutation = useMutation(gamesMutations.update());
  const removeMutation = useMutation(gamesMutations.remove());

  return {
    games,
    isLoading,
    addGame: addMutation.mutate,
    importGame: importMutation.mutate,
    updateGame: updateMutation.mutate,
    removeGame: removeMutation.mutate,
    isAdding: addMutation.isPending,
    isImporting: importMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
