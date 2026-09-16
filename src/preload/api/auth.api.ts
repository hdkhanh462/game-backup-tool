import { ipcRenderer } from 'electron';

import type { AuthStatus } from '../../shared/types';

export function createAuthApi() {
  return {
    getStatus: (): Promise<AuthStatus> => ipcRenderer.invoke('auth:getStatus'),
    connect: (): Promise<AuthStatus> => ipcRenderer.invoke('auth:connect'),
    disconnect: (): Promise<void> => ipcRenderer.invoke('auth:disconnect'),
    setRootFolder: (folder: { id: string; path: string }): Promise<AuthStatus> => ipcRenderer.invoke('auth:setRootFolder', folder),
  };
}

export type AuthApi = ReturnType<typeof createAuthApi>;
