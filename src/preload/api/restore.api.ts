import { ipcRenderer } from 'electron';

import type { RestoreOptions, TransferProgress } from '../../shared/types';
import { subscribeToProgress } from './subscribe';

export function createRestoreApi() {
  return {
    run: (gameId: string, versionId: string, options: RestoreOptions): Promise<void> => ipcRenderer.invoke('restore:run', gameId, versionId, options),
    onProgress: (cb: (progress: TransferProgress) => void): (() => void) => subscribeToProgress('restore:progress', cb),
  };
}

export type RestoreApi = ReturnType<typeof createRestoreApi>;
