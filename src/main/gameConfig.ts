import { randomUUID } from 'crypto';
import { app } from 'electron';
import { appendFile, mkdir, rm, writeFile } from 'fs/promises';
import path from 'path';

import { normalizeFilter } from '../shared/gameFilter';
import type { Game, GameFilter, GameSyncConfig } from '../shared/types';
import * as auth from './auth';
import * as drive from './drive';

const CONFIG_FILE_NAME = 'game-backup-config.json';

/** Appends to <userData>/sync.log so sync problems are diagnosable in packaged builds, where there is no console. */
async function logSync(message: string): Promise<void> {
  try {
    await appendFile(
      path.join(app.getPath('userData'), 'sync.log'),
      `${new Date().toISOString()} ${message}
`,
      'utf-8',
    );
  } catch {
    // logging must never affect the app
  }
}

function describeError(error: unknown): string {
  const response = (error as { response?: { status?: number; data?: unknown } }).response;
  if (response) return `HTTP ${response.status} ${JSON.stringify(response.data)}`;
  return error instanceof Error ? error.message : String(error);
}

type GameEntry = Omit<GameSyncConfig, 'schemaVersion'>;

interface RootConfig {
  schemaVersion: 1;
  /** Keyed by the game's Drive folder id, so renaming a folder never orphans its settings. */
  games: Record<string, GameEntry>;
}

export interface SyncedGameSettings {
  localPath: string | null;
  filter: GameFilter | null;
}

async function loadRootConfig(rootId: string): Promise<{ fileId: string | null; config: RootConfig }> {
  const files = await drive.listFiles(rootId);
  const fileId = files.find((f) => f.name === CONFIG_FILE_NAME)?.id ?? null;
  if (!fileId) return { fileId, config: { schemaVersion: 1, games: {} } };
  const parsed = JSON.parse((await drive.downloadFileContent(fileId)).toString('utf-8')) as Partial<RootConfig>;
  return { fileId, config: { schemaVersion: 1, games: parsed.games ?? {} } };
}

/** Writes the config to a real local JSON file and uploads it (same path as save files), then removes the previous copy. */
async function uploadConfigFile(rootId: string, config: RootConfig, previousFileId: string | null): Promise<void> {
  const dir = path.join(app.getPath('temp'), 'gamesave-backup');
  await mkdir(dir, { recursive: true });
  const localFile = path.join(dir, `${randomUUID()}-${CONFIG_FILE_NAME}`);
  try {
    await writeFile(localFile, JSON.stringify(config, null, 2), 'utf-8');
    await drive.uploadFile(localFile, { name: CONFIG_FILE_NAME, parents: [rootId] });
  } finally {
    await rm(localFile, { force: true }).catch(() => undefined);
  }
  // Delete the old copy only after the new one is uploaded, so a failed upload never loses the config.
  if (previousFileId) await drive.deleteFile(previousFileId).catch(() => undefined);
}

// Serialises read-modify-write cycles so concurrent add/update/backup calls in this app can't overwrite each other.
let writeQueue: Promise<void> = Promise.resolve();

/** Best-effort: saves a game's portable settings into one shared config file in the backup root folder. Never throws. */
export function write(game: Pick<Game, 'name' | 'localPath' | 'filter' | 'driveFolderId'>): Promise<void> {
  const task = writeQueue.then(async () => {
    const rootId = auth.getStatus().rootFolderId;
    if (!rootId || !game.driveFolderId) {
      await logSync(`skipped sync for ${game.name}: rootFolderId=${rootId} driveFolderId=${game.driveFolderId}`);
      return;
    }
    try {
      const { fileId, config } = await loadRootConfig(rootId);
      config.games[game.driveFolderId] = { name: game.name, localPath: game.localPath, filter: game.filter };
      await uploadConfigFile(rootId, config, fileId);
      await logSync(`synced ${game.name} to root ${rootId} (${fileId ? 'replaced existing file' : 'created new file'}, ${Object.keys(config.games).length} games)`);
    } catch (error) {
      // syncing is a convenience; a failure must not break add/update/backup
      await logSync(`FAILED to sync ${game.name} to root ${rootId}: ${describeError(error)}`);
    }
  });
  writeQueue = task;
  return task;
}

/** Reads every game's synced settings with a single Drive lookup, keyed by Drive folder id. Never throws. */
export async function readAll(rootId: string): Promise<Map<string, SyncedGameSettings>> {
  const result = new Map<string, SyncedGameSettings>();
  try {
    const { config } = await loadRootConfig(rootId);
    for (const [folderId, entry] of Object.entries(config.games)) {
      result.set(folderId, {
        localPath: typeof entry.localPath === 'string' && entry.localPath ? entry.localPath : null,
        filter: entry.filter ? normalizeFilter(entry.filter) : null,
      });
    }
  } catch (error) {
    // no config yet or unreadable: candidates just come back without a suggested path
    await logSync(`FAILED to read synced settings from root ${rootId}: ${describeError(error)}`);
  }
  return result;
}
