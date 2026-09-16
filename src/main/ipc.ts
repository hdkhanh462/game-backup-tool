import { dialog, ipcMain, shell } from 'electron';

import type { GameInput } from '../shared/types';
import * as auth from './auth';
import * as drive from './drive';
import * as games from './games';

export function registerIpcHandlers(): void {
  ipcMain.handle('auth:getStatus', () => auth.getStatus());
  ipcMain.handle('auth:connect', () => auth.connect());
  ipcMain.handle('auth:disconnect', () => auth.disconnect());
  ipcMain.handle('auth:setRootFolder', (_event, folder: { id: string; path: string }) => auth.setRootFolder(folder));

  ipcMain.handle('drive:listFolders', (_event, parentId: string) => drive.listFolders(parentId));
  ipcMain.handle('drive:createFolder', (_event, name: string, parentId: string) => drive.createFolder(name, parentId));

  ipcMain.handle('games:list', () => games.list());
  ipcMain.handle('games:add', (_event, input: GameInput) => games.add(input));
  ipcMain.handle('games:update', (_event, id: string, patch: Partial<GameInput>) => games.update(id, patch));
  ipcMain.handle('games:remove', (_event, id: string) => games.remove(id));

  ipcMain.handle('system:pickFolder', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });
  ipcMain.handle('system:openPath', (_event, path: string) => shell.openPath(path));
}
