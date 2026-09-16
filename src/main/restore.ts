import { createWriteStream } from 'fs';
import { mkdir, readdir, rm } from 'fs/promises';
import path from 'path';
import { pipeline } from 'stream/promises';

import type { Game, RestoreOptions, TransferProgress } from '../shared/types';
import { fetchVersionManifest, runBackup } from './backup';
import * as drive from './drive';

function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

async function walkRelative(dir: string, base: string, results: string[] = []): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkRelative(absolutePath, base, results);
    } else if (entry.isFile()) {
      results.push(toPosix(path.relative(base, absolutePath)));
    }
  }
  return results;
}

export async function runRestore(game: Game, versionId: string, options: RestoreOptions, onProgress: (progress: TransferProgress) => void): Promise<void> {
  if (!game.driveFolderId) throw new Error('This game has no Drive folder configured');

  const emit = (partial: Omit<TransferProgress, 'gameId' | 'op'>): void => {
    onProgress({ gameId: game.id, op: 'restore', ...partial });
  };

  emit({ phase: 'safetyBackup', filesDone: 0, filesTotal: 0, bytesDone: 0, bytesTotal: 0 });

  if (options.safetyBackup) {
    await runBackup(game, (backupProgress) => {
      emit({ ...backupProgress, phase: 'safetyBackup' });
    });
  }

  emit({ phase: 'scanning', filesDone: 0, filesTotal: 0, bytesDone: 0, bytesTotal: 0 });
  const manifest = await fetchVersionManifest(versionId);
  const filesTotal = manifest.files.length;
  const bytesTotal = manifest.totalBytes;
  let filesDone = 0;
  let bytesDone = 0;

  for (const entry of manifest.files) {
    const destPath = path.join(game.localPath, ...entry.path.split('/'));
    await mkdir(path.dirname(destPath), { recursive: true });

    emit({ phase: 'downloading', currentFile: entry.path, filesDone, filesTotal, bytesDone, bytesTotal });
    const readable = await drive.downloadFileStream(entry.fileId);
    let fileBytesDone = 0;
    readable.on('data', (chunk: string | Buffer) => {
      fileBytesDone += chunk.length;
      emit({ phase: 'downloading', currentFile: entry.path, filesDone, filesTotal, bytesDone: bytesDone + fileBytesDone, bytesTotal });
    });
    await pipeline(readable, createWriteStream(destPath));

    bytesDone += entry.size;
    filesDone += 1;
    emit({ phase: 'downloading', currentFile: entry.path, filesDone, filesTotal, bytesDone, bytesTotal });
  }

  if (options.deleteExtraneous) {
    emit({ phase: 'cleanup', filesDone, filesTotal, bytesDone, bytesTotal });
    const manifestPaths = new Set(manifest.files.map((f) => f.path));
    const localFiles = await walkRelative(game.localPath, game.localPath);
    for (const relativePath of localFiles) {
      if (!manifestPaths.has(relativePath)) {
        const absolutePath = path.join(game.localPath, ...relativePath.split('/'));
        await rm(absolutePath, { force: true });
      }
    }
  }

  emit({ phase: 'done', filesDone, filesTotal, bytesDone, bytesTotal });
}
