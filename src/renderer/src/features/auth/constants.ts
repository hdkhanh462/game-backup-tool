import type { AuthStatus } from '@shared/types';

export const DISCONNECTED_AUTH_STATUS: AuthStatus = {
  state: 'disconnected',
  email: null,
  name: null,
  picture: null,
  rootFolderId: null,
  rootFolderPath: null,
};
