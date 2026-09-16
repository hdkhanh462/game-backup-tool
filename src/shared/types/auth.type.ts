export type AuthConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface AuthStatus {
  state: AuthConnectionState;
  email: string | null;
  name: string | null;
  picture: string | null;
  rootFolderId: string | null;
  rootFolderPath: string | null;
  error?: string;
}
