import { electronAPI } from '@electron-toolkit/preload';
import { contextBridge, ipcRenderer } from 'electron';

import type { AuthStatus, DriveFolder, DriveListFoldersResult, Game, GameInput } from '../shared/types';

const api = {
  auth: {
    getStatus: (): Promise<AuthStatus> => ipcRenderer.invoke('auth:getStatus'),
    connect: (): Promise<AuthStatus> => ipcRenderer.invoke('auth:connect'),
    disconnect: (): Promise<void> => ipcRenderer.invoke('auth:disconnect'),
    setRootFolder: (folder: { id: string; path: string }): Promise<AuthStatus> => ipcRenderer.invoke('auth:setRootFolder', folder),
  },
  drive: {
    listFolders: (parentId: string): Promise<DriveListFoldersResult> => ipcRenderer.invoke('drive:listFolders', parentId),
    createFolder: (name: string, parentId: string): Promise<DriveFolder> => ipcRenderer.invoke('drive:createFolder', name, parentId),
  },
  games: {
    list: (): Promise<Game[]> => ipcRenderer.invoke('games:list'),
    add: (input: GameInput): Promise<Game> => ipcRenderer.invoke('games:add', input),
    update: (id: string, patch: Partial<GameInput>): Promise<Game> => ipcRenderer.invoke('games:update', id, patch),
    remove: (id: string): Promise<void> => ipcRenderer.invoke('games:remove', id),
  },
  system: {
    pickFolder: (): Promise<string | null> => ipcRenderer.invoke('system:pickFolder'),
    openPath: (path: string): Promise<void> => ipcRenderer.invoke('system:openPath', path),
  },
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}

export type Api = typeof api;
