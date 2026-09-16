import type { AppSettings, Game } from '../../shared/types';

export interface StoreSchema {
  games: Game[];
  auth: {
    email: string | null;
    name: string | null;
    picture: string | null;
    rootFolderId: string | null;
    rootFolderPath: string | null;
    connectedAt: string | null;
    refreshTokenEnc: string | null;
  };
  settings: AppSettings;
}
