import { ipcRenderer } from 'electron';

export function createSystemApi() {
  return {
    pickFolder: (): Promise<string | null> => ipcRenderer.invoke('system:pickFolder'),
    openPath: (path: string): Promise<void> => ipcRenderer.invoke('system:openPath', path),
  };
}

export type SystemApi = ReturnType<typeof createSystemApi>;
