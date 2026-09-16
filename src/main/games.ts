import { randomUUID } from 'crypto';

import type { Game, GameInput } from '../shared/types';
import { getStore } from './store';

export async function list(): Promise<Game[]> {
  const store = await getStore();
  return store.get('games');
}

export async function add(input: GameInput): Promise<Game> {
  const store = await getStore();
  const now = new Date().toISOString();
  const game: Game = {
    id: randomUUID(),
    name: input.name,
    localPath: input.localPath,
    driveFolderId: input.driveFolderId,
    driveFolderPath: input.driveFolderPath,
    lastBackupAt: null,
    lastBackupStatus: 'never',
    createdAt: now,
    updatedAt: now,
  };
  const games = store.get('games');
  games.push(game);
  store.set('games', games);
  return game;
}

export async function update(id: string, patch: Partial<GameInput>): Promise<Game> {
  const store = await getStore();
  const games = store.get('games');
  const index = games.findIndex((g) => g.id === id);
  if (index === -1) throw new Error(`Game not found: ${id}`);
  const updated: Game = { ...games[index], ...patch, updatedAt: new Date().toISOString() };
  games[index] = updated;
  store.set('games', games);
  return updated;
}

export async function remove(id: string): Promise<void> {
  const store = await getStore();
  const games = store.get('games').filter((g) => g.id !== id);
  store.set('games', games);
}
