export type GameFilterMode = 'none' | 'blacklist' | 'whitelist';

export interface GameFilter {
  mode: GameFilterMode;
  /** Lowercase extensions without the leading dot. An empty string matches files with no extension. */
  extensions: string[];
}

export interface Game {
  id: string;
  name: string;
  /** May contain placeholders such as %USERPROFILE% or %APPDATA%; resolve with the main-process path helper before touching the disk. */
  localPath: string;
  driveFolderId: string | null;
  driveFolderPath: string | null;
  filter: GameFilter;
  lastBackupAt: string | null;
  lastBackupStatus: 'never' | 'success' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export type GameInput = Pick<Game, 'name' | 'localPath' | 'driveFolderId' | 'driveFolderPath' | 'filter'>;

/** Portable per-game settings stored in the game's Drive folder so other devices can pick them up. */
export interface GameSyncConfig {
  schemaVersion: 1;
  name: string;
  localPath: string;
  filter: GameFilter;
}

export interface DriveGameCandidate {
  id: string;
  name: string;
  path: string;
  /** Local path template saved by another device, if any. */
  localPath: string | null;
  filter: GameFilter | null;
}
