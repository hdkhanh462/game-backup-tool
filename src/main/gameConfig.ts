import { normalizeFilter } from '../shared/gameFilter';
import type { Game, GameFilter, GameSyncConfig } from '../shared/types';
import * as drive from './drive';

const CONFIG_FILE_NAME = 'game-config.json';

async function findConfigFileId(folderId: string): Promise<string | null> {
  const files = await drive.listFiles(folderId);
  return files.find((f) => f.name === CONFIG_FILE_NAME)?.id ?? null;
}

/** Best-effort: stores portable settings in the game's Drive folder. Never throws. */
export async function write(game: Pick<Game, 'name' | 'localPath' | 'filter' | 'driveFolderId'>): Promise<void> {
  if (!game.driveFolderId) return;
  try {
    const config: GameSyncConfig = { schemaVersion: 1, name: game.name, localPath: game.localPath, filter: game.filter };
    const buffer = Buffer.from(JSON.stringify(config, null, 2));
    const existingId = await findConfigFileId(game.driveFolderId);
    if (existingId) await drive.updateBuffer(existingId, buffer, 'application/json');
    else await drive.uploadBuffer(buffer, { name: CONFIG_FILE_NAME, parents: [game.driveFolderId], mimeType: 'application/json' });
  } catch {
    // syncing is a convenience; a failure must not break add/update/backup
  }
}

export async function read(folderId: string): Promise<{ localPath: string | null; filter: GameFilter | null }> {
  try {
    const fileId = await findConfigFileId(folderId);
    if (!fileId) return { localPath: null, filter: null };
    const config = JSON.parse((await drive.downloadFileContent(fileId)).toString('utf-8')) as Partial<GameSyncConfig>;
    return {
      localPath: typeof config.localPath === 'string' && config.localPath ? config.localPath : null,
      filter: config.filter ? normalizeFilter(config.filter) : null,
    };
  } catch {
    return { localPath: null, filter: null };
  }
}
