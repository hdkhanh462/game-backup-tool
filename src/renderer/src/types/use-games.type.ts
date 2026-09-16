import type { Game, GameInput } from '@shared/types';

export interface UseGamesResult {
  games: Game[];
  isLoading: boolean;
  addGame: (input: GameInput) => Promise<Game>;
  updateGame: (id: string, patch: Partial<GameInput>) => Promise<Game>;
  removeGame: (id: string) => Promise<void>;
}
