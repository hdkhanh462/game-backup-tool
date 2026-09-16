export interface Game {
  id: string;
  name: string;
  localPath: string;
  driveFolderId: string | null;
  driveFolderPath: string | null;
  lastBackupAt: string | null;
  lastBackupStatus: 'never' | 'success' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export type GameInput = Pick<Game, 'name' | 'localPath' | 'driveFolderId' | 'driveFolderPath'>;
