import { api } from '@renderer/lib/api';
import type { Game, GameInput } from '@shared/types';
import { useCallback, useEffect, useState } from 'react';

interface UseGamesResult {
  games: Game[];
  loading: boolean;
  addGame: (input: GameInput) => Promise<Game>;
  updateGame: (id: string, patch: Partial<GameInput>) => Promise<Game>;
  removeGame: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useGames(): UseGamesResult {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.games.list();
      setGames(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addGame = useCallback(async (input: GameInput) => {
    const game = await api.games.add(input);
    setGames((prev) => [...prev, game]);
    return game;
  }, []);

  const updateGame = useCallback(async (id: string, patch: Partial<GameInput>) => {
    const updated = await api.games.update(id, patch);
    setGames((prev) => prev.map((g) => (g.id === id ? updated : g)));
    return updated;
  }, []);

  const removeGame = useCallback(async (id: string) => {
    await api.games.remove(id);
    setGames((prev) => prev.filter((g) => g.id !== id));
  }, []);

  return { games, loading, addGame, updateGame, removeGame, refresh };
}
