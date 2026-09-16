import type { Game, GameInput } from '@shared/types';

export interface GameCardProps {
  game: Game;
}

export interface GameFormValues {
  name: string;
  localPath: string;
  driveFolderId: string | null;
  driveFolderPath: string | null;
}

export interface GameFormProps {
  defaultValues?: GameFormValues;
  isConnected: boolean;
  rootFolderId: string | null;
  rootFolderPath: string | null;
  onSubmit: (values: GameFormValues) => Promise<void> | void;
  onCancel: () => void;
}

export interface UseGamesResult {
  games: Game[];
  isLoading: boolean;
  addGame: (input: GameInput) => Promise<Game>;
  updateGame: (id: string, patch: Partial<GameInput>) => Promise<Game>;
  removeGame: (id: string) => Promise<void>;
}
