import { ipcRenderer } from 'electron';

export function createSystemApi() {
  return {
    pickFolder: (): Promise<string | null> => ipcRenderer.invoke('system:pickFolder'),
    getVersion: (): Promise<string> => ipcRenderer.invoke('system:getVersion'),
    collapsePath: (absolutePath: string): Promise<string> => ipcRenderer.invoke('system:collapsePath', absolutePath),
    expandPath: (template: string): Promise<{ ok: true; path: string } | { ok: false; error: string }> => ipcRenderer.invoke('system:expandPath', template),
    openPath: (path: string): Promise<void> => ipcRenderer.invoke('system:openPath', path),
  };
}

export type SystemApi = ReturnType<typeof createSystemApi>;
