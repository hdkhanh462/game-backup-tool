import type { Game, GameFilter, GameInput } from '@shared/types';
import type { UseMutateFunction } from '@tanstack/react-query';

export interface GameCardProps {
  game: Game;
}

export interface GameFormValues {
  name: string;
  localPath: string;
  driveFolderId: string | null;
  driveFolderPath: string | null;
  filter: GameFilter;
}

export interface GameFormProps {
  defaultValues?: GameFormValues;
  isConnected: boolean;
  isPending?: boolean;
  rootFolderId: string | null;
  rootFolderPath: string | null;
  onSubmit: (values: GameFormValues) => void;
  onCancel: () => void;
}

export interface UpdateGameInput {
  id: string;
  patch: Partial<GameInput>;
}

export interface UseGamesResult {
  games: Game[];
  isLoading: boolean;
  addGame: UseMutateFunction<Game, Error, GameInput>;
  importGame: UseMutateFunction<Game, Error, GameInput>;
  updateGame: UseMutateFunction<Game, Error, UpdateGameInput>;
  removeGame: UseMutateFunction<void, Error, string>;
  isAdding: boolean;
  isImporting: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
}
