import type { Game } from '../../shared/types';

export interface StoreSchema {
  games: Game[];
  auth: {
    email: string | null;
    rootFolderId: string | null;
    rootFolderPath: string | null;
    connectedAt: string | null;
    refreshTokenEnc: string | null;
  };
}
