import { useMutation, useQuery } from '@tanstack/react-query';

import { gamesMutations } from '../mutations';
import { gamesQueries } from '../queries';
import type { UseGamesResult } from '../types';

export function useGames(): UseGamesResult {
  const { data: games = [], isLoading } = useQuery(gamesQueries.list());
  const addMutation = useMutation(gamesMutations.add());
  const updateMutation = useMutation(gamesMutations.update());
  const removeMutation = useMutation(gamesMutations.remove());

  return {
    games,
    isLoading,
    addGame: addMutation.mutate,
    updateGame: updateMutation.mutate,
    removeGame: removeMutation.mutate,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
