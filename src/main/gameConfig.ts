import { normalizeFilter } from '../shared/gameFilter';
import type { Game, GameFilter, GameSyncConfig } from '../shared/types';
import * as auth from './auth';
import * as drive from './drive';

const CONFIG_FILE_NAME = 'game-backup-config.json';

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

// Serialises read-modify-write cycles so concurrent add/update/backup calls in this app can't overwrite each other.
let writeQueue: Promise<void> = Promise.resolve();

/** Best-effort: saves a game's portable settings into one shared config file in the backup root folder. Never throws. */
export function write(game: Pick<Game, 'name' | 'localPath' | 'filter' | 'driveFolderId'>): Promise<void> {
  const task = writeQueue.then(async () => {
    const rootId = auth.getStatus().rootFolderId;
    if (!rootId || !game.driveFolderId) return;
    try {
      const { fileId, config } = await loadRootConfig(rootId);
      config.games[game.driveFolderId] = { name: game.name, localPath: game.localPath, filter: game.filter };
      const buffer = Buffer.from(JSON.stringify(config, null, 2));
      if (fileId) await drive.updateBuffer(fileId, buffer, 'application/json');
      else await drive.uploadBuffer(buffer, { name: CONFIG_FILE_NAME, parents: [rootId], mimeType: 'application/json' });
    } catch {
      // syncing is a convenience; a failure must not break add/update/backup
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
  } catch {
    // no config yet or unreadable: candidates just come back without a suggested path
  }
  return result;
}
