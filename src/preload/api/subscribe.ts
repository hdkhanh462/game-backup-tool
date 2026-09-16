import type { IpcRendererEvent } from 'electron';
import { ipcRenderer } from 'electron';

import type { TransferProgress } from '../../shared/types';

export function subscribeToProgress(channel: string, cb: (progress: TransferProgress) => void): () => void {
  const listener = (_event: IpcRendererEvent, progress: TransferProgress): void => cb(progress);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}
