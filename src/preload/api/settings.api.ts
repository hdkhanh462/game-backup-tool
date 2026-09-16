import { ipcRenderer } from 'electron';

import type { AppSettings } from '../../shared/types';

export function createSettingsApi() {
  return {
    get: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
    update: (patch: Partial<AppSettings>): Promise<AppSettings> => ipcRenderer.invoke('settings:update', patch),
  };
}

export type SettingsApi = ReturnType<typeof createSettingsApi>;
