import { ipcRenderer } from 'electron';

import type { BackupRunResult, BackupVersion, TransferProgress } from '../../shared/types';
import { subscribeToProgress } from './subscribe';

export function createBackupApi() {
  return {
    run: (gameId: string): Promise<BackupRunResult> => ipcRenderer.invoke('backup:run', gameId),
    listVersions: (gameId: string): Promise<BackupVersion[]> => ipcRenderer.invoke('backup:listVersions', gameId),
    deleteVersion: (gameId: string, versionId: string): Promise<void> => ipcRenderer.invoke('backup:deleteVersion', gameId, versionId),
    getActiveOperations: (): Promise<TransferProgress[]> => ipcRenderer.invoke('backup:getActiveOperations'),
    onProgress: (cb: (progress: TransferProgress) => void): (() => void) => subscribeToProgress('backup:progress', cb),
  };
}

export type BackupApi = ReturnType<typeof createBackupApi>;
