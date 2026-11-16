import { dialog, ipcMain, shell } from 'electron';

import type { AppSettings, GameInput, RestoreOptions } from '../shared/types';
import * as auth from './auth';
import * as backup from './backup';
import * as drive from './drive';
import * as games from './games';
import { clearOperation, isBusy, listOperations, setOperation } from './operationTracker';
import { collapsePath, expandPath } from './pathTemplate';
import * as restore from './restore';
import * as settings from './settings';

export function registerIpcHandlers(): void {
  ipcMain.handle('auth:getStatus', () => auth.getStatus());
  ipcMain.handle('auth:connect', () => auth.connect());
  ipcMain.handle('auth:cancelConnect', () => auth.cancelConnect());
  ipcMain.handle('auth:copyAuthUrl', () => auth.copyAuthUrl());
  ipcMain.handle('auth:disconnect', () => auth.disconnect());
  ipcMain.handle('auth:setRootFolder', (_event, folder: { id: string; path: string }) => auth.setRootFolder(folder));

  ipcMain.handle('drive:listFolders', (_event, parentId: string) => drive.listFolders(parentId));
  ipcMain.handle('drive:createFolder', (_event, name: string, parentId: string) => drive.createFolder(name, parentId));
  ipcMain.handle('drive:getAbout', () => drive.getAbout());

  ipcMain.handle('games:list', () => games.list());
  ipcMain.handle('games:listImportCandidates', () => games.listImportCandidates());
  ipcMain.handle('games:import', (_event, input: GameInput) => games.importGame(input));
  ipcMain.handle('games:add', (_event, input: GameInput) => games.add(input));
  ipcMain.handle('games:update', (_event, id: string, patch: Partial<GameInput>) => games.update(id, patch));
  ipcMain.handle('games:remove', (_event, id: string) => games.remove(id));

  ipcMain.handle('backup:run', async (event, gameId: string) => {
    if (isBusy(gameId)) throw new Error('A backup or restore is already running for this game');
    const game = await games.get(gameId);
    try {
      return await backup.runBackup(game, (progress) => {
        setOperation(gameId, progress);
        event.sender.send('backup:progress', progress);
      });
    } finally {
      clearOperation(gameId);
    }
  });
  ipcMain.handle('backup:listVersions', async (_event, gameId: string) => {
    const game = await games.get(gameId);
    if (!game.driveFolderId) return [];
    return backup.listVersions(game.driveFolderId);
  });
  ipcMain.handle('backup:deleteVersion', (_event, _gameId: string, versionId: string) => backup.deleteVersion(versionId));
  ipcMain.handle('backup:getActiveOperations', () => listOperations());

  ipcMain.handle('restore:run', async (event, gameId: string, versionId: string, options: RestoreOptions) => {
    if (isBusy(gameId)) throw new Error('A backup or restore is already running for this game');
    const game = await games.get(gameId);
    try {
      await restore.runRestore(game, versionId, options, (progress) => {
        setOperation(gameId, progress);
        event.sender.send('restore:progress', progress);
      });
    } finally {
      clearOperation(gameId);
    }
  });

  ipcMain.handle('settings:get', () => settings.get());
  ipcMain.handle('settings:update', (_event, patch: Partial<AppSettings>) => settings.update(patch));

  ipcMain.handle('system:pickFolder', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });
  ipcMain.handle('system:openPath', (_event, path: string) => shell.openPath(expandPath(path)));
  ipcMain.handle('system:collapsePath', (_event, absolutePath: string) => collapsePath(absolutePath));
  ipcMain.handle('system:expandPath', (_event, template: string) => {
    try {
      return { ok: true as const, path: expandPath(template) };
    } catch (error) {
      return { ok: false as const, error: error instanceof Error ? error.message : String(error) };
    }
  });
}
