import { ipcRenderer } from 'electron';

import type { DriveFolder, DriveListFoldersResult } from '../../shared/types';

export function createDriveApi() {
  return {
    listFolders: (parentId: string): Promise<DriveListFoldersResult> => ipcRenderer.invoke('drive:listFolders', parentId),
    createFolder: (name: string, parentId: string): Promise<DriveFolder> => ipcRenderer.invoke('drive:createFolder', name, parentId),
    getAbout: (): Promise<{ usage: number; limit: number | null }> => ipcRenderer.invoke('drive:getAbout'),
  };
}

export type DriveApi = ReturnType<typeof createDriveApi>;
