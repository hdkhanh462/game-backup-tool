import { electronAPI } from '@electron-toolkit/preload';
import { contextBridge } from 'electron';

import { createApi } from './api';

const api = createApi();

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

export type { Api } from './api';
