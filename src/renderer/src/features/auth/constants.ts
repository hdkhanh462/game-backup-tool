import type { AuthStatus } from '@shared/types';

export const DISCONNECTED_AUTH_STATUS: AuthStatus = {
  state: 'disconnected',
  email: null,
  rootFolderId: null,
  rootFolderPath: null,
};
