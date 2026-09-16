import { ipcRenderer } from 'electron';

import type { DriveGameCandidate, Game, GameInput } from '../../shared/types';

export function createGamesApi() {
  return {
    list: (): Promise<Game[]> => ipcRenderer.invoke('games:list'),
    listImportCandidates: (): Promise<DriveGameCandidate[]> => ipcRenderer.invoke('games:listImportCandidates'),
    add: (input: GameInput): Promise<Game> => ipcRenderer.invoke('games:add', input),
    update: (id: string, patch: Partial<GameInput>): Promise<Game> => ipcRenderer.invoke('games:update', id, patch),
    remove: (id: string): Promise<void> => ipcRenderer.invoke('games:remove', id),
  };
}

export type GamesApi = ReturnType<typeof createGamesApi>;
