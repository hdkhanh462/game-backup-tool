import { randomUUID } from 'crypto';

import { normalizeFilter } from '../shared/gameFilter';
import type { DriveGameCandidate, Game, GameInput } from '../shared/types';
import * as auth from './auth';
import * as backup from './backup';
import * as drive from './drive';
import * as gameConfig from './gameConfig';
import { getStore } from './store';

function withFilter(game: Game): Game {
  return { ...game, filter: normalizeFilter(game.filter) };
}

export async function list(): Promise<Game[]> {
  const store = await getStore();
  return store.get('games').map(withFilter);
}

export async function get(id: string): Promise<Game> {
  const store = await getStore();
  const game = store.get('games').find((g) => g.id === id);
  if (!game) throw new Error(`Game not found: ${id}`);
  return withFilter(game);
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
    filter: normalizeFilter(input.filter),
    lastBackupAt: null,
    lastBackupStatus: 'never',
    createdAt: now,
    updatedAt: now,
  };
  const games = store.get('games');
  games.push(game);
  store.set('games', games);
  void gameConfig.write(game);
  return game;
}

export async function update(id: string, patch: Partial<GameInput>): Promise<Game> {
  const store = await getStore();
  const games = store.get('games');
  const index = games.findIndex((g) => g.id === id);
  if (index === -1) throw new Error(`Game not found: ${id}`);
  const updated: Game = { ...games[index], ...patch, filter: normalizeFilter(patch.filter ?? games[index].filter), updatedAt: new Date().toISOString() };
  games[index] = updated;
  store.set('games', games);
  void gameConfig.write(updated);
  return updated;
}

export async function remove(id: string): Promise<void> {
  const store = await getStore();
  const games = store.get('games').filter((g) => g.id !== id);
  store.set('games', games);
}

export async function importGame(input: GameInput): Promise<Game> {
  const created = await add(input);
  if (!created.driveFolderId) return created;

  try {
    const versions = await backup.listVersions(created.driveFolderId);
    if (versions.length > 0) {
      return await recordBackupResult(created.id, { lastBackupAt: versions[0].createdAt, lastBackupStatus: 'success' });
    }
  } catch {
    // best-effort; keep the freshly created game as 'never' if Drive lookup fails
  }
  return created;
}

export async function listImportCandidates(): Promise<DriveGameCandidate[]> {
  const status = auth.getStatus();
  if (status.state !== 'connected' || !status.rootFolderId) return [];

  const store = await getStore();
  const claimedIds = new Set(
    store
      .get('games')
      .map((g) => g.driveFolderId)
      .filter((id): id is string => id !== null),
  );

  const rootPath = status.rootFolderPath ?? 'My Drive';
  const { folders } = await drive.listFolders(status.rootFolderId);
  const unclaimed = folders.filter((folder) => !claimedIds.has(folder.id));
  return Promise.all(
    unclaimed.map(async (folder) => {
      const config = await gameConfig.read(folder.id);
      return { id: folder.id, name: folder.name, path: `${rootPath}/${folder.name}`, localPath: config.localPath, filter: config.filter };
    }),
  );
}

export async function recordBackupResult(id: string, result: { lastBackupAt: string | null; lastBackupStatus: Game['lastBackupStatus'] }): Promise<Game> {
  const store = await getStore();
  const games = store.get('games');
  const index = games.findIndex((g) => g.id === id);
  if (index === -1) throw new Error(`Game not found: ${id}`);
  const updated: Game = { ...games[index], ...result, updatedAt: new Date().toISOString() };
  games[index] = updated;
  store.set('games', games);
  return updated;
}
