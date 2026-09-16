import { electronAPI } from '@electron-toolkit/preload';
import type { IpcRendererEvent } from 'electron';
import { contextBridge, ipcRenderer } from 'electron';

import type { AppSettings, AuthStatus, BackupRunResult, BackupVersion, DriveFolder, DriveListFoldersResult, Game, GameInput, RestoreOptions, TransferProgress } from '../shared/types';

function subscribe(channel: string, cb: (progress: TransferProgress) => void): () => void {
  const listener = (_event: IpcRendererEvent, progress: TransferProgress): void => cb(progress);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

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
    getAbout: (): Promise<{ usage: number; limit: number | null }> => ipcRenderer.invoke('drive:getAbout'),
  },
  games: {
    list: (): Promise<Game[]> => ipcRenderer.invoke('games:list'),
    add: (input: GameInput): Promise<Game> => ipcRenderer.invoke('games:add', input),
    update: (id: string, patch: Partial<GameInput>): Promise<Game> => ipcRenderer.invoke('games:update', id, patch),
    remove: (id: string): Promise<void> => ipcRenderer.invoke('games:remove', id),
  },
  backup: {
    run: (gameId: string): Promise<BackupRunResult> => ipcRenderer.invoke('backup:run', gameId),
    listVersions: (gameId: string): Promise<BackupVersion[]> => ipcRenderer.invoke('backup:listVersions', gameId),
    deleteVersion: (gameId: string, versionId: string): Promise<void> => ipcRenderer.invoke('backup:deleteVersion', gameId, versionId),
    getActiveOperations: (): Promise<TransferProgress[]> => ipcRenderer.invoke('backup:getActiveOperations'),
    onProgress: (cb: (progress: TransferProgress) => void): (() => void) => subscribe('backup:progress', cb),
  },
  restore: {
    run: (gameId: string, versionId: string, options: RestoreOptions): Promise<void> => ipcRenderer.invoke('restore:run', gameId, versionId, options),
    onProgress: (cb: (progress: TransferProgress) => void): (() => void) => subscribe('restore:progress', cb),
  },
  settings: {
    get: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
    update: (patch: Partial<AppSettings>): Promise<AppSettings> => ipcRenderer.invoke('settings:update', patch),
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
