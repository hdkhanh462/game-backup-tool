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

export type AuthConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface AuthStatus {
  state: AuthConnectionState;
  email: string | null;
  rootFolderId: string | null;
  rootFolderPath: string | null;
  error?: string;
}

export interface DriveFolder {
  id: string;
  name: string;
}

export interface DriveListFoldersResult {
  parentId: string;
  folders: DriveFolder[];
}
