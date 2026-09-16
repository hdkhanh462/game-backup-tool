import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { readdir, stat } from 'fs/promises';
import { hostname } from 'os';
import path from 'path';

import type { BackupManifest, BackupManifestFileEntry, BackupVersion, Game, TransferProgress } from '../shared/types';
import * as drive from './drive';
import * as games from './games';
import * as settingsModule from './settings';

interface ScannedFile {
  relativePath: string;
  absolutePath: string;
  size: number;
  sha256: string;
}

function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

function formatVersionName(date: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}

async function walk(dir: string, results: string[] = []): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(absolutePath, results);
    } else if (entry.isFile()) {
      results.push(absolutePath);
    }
  }
  return results;
}

function hashFile(absolutePath: string, onChunk: (bytes: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(absolutePath);
    stream.on('data', (chunk: string | Buffer) => {
      hash.update(chunk);
      onChunk(chunk.length);
    });
    stream.on('error', reject);
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

async function ensureDriveDir(dirPath: string, rootId: string, cache: Map<string, string>): Promise<string> {
  if (!dirPath) return rootId;
  const cached = cache.get(dirPath);
  if (cached) return cached;
  const parentDir = path.posix.dirname(dirPath);
  const parentId = await ensureDriveDir(parentDir === '.' ? '' : parentDir, rootId, cache);
  const name = path.posix.basename(dirPath);
  const folder = await drive.createFolder(name, parentId);
  cache.set(dirPath, folder.id);
  return folder.id;
}

async function findManifestFileId(versionFolderId: string): Promise<string | null> {
  const files = await drive.listFiles(versionFolderId);
  return files.find((f) => f.name === 'manifest.json')?.id ?? null;
}

async function fetchManifest(manifestFileId: string): Promise<BackupManifest | null> {
  try {
    const buffer = await drive.downloadFileContent(manifestFileId);
    return JSON.parse(buffer.toString('utf-8')) as BackupManifest;
  } catch {
    return null;
  }
}

export async function listVersions(driveFolderId: string): Promise<BackupVersion[]> {
  const { folders } = await drive.listFolders(driveFolderId);
  const sorted = [...folders].sort((a, b) => b.name.localeCompare(a.name));
  const versions: BackupVersion[] = [];
  for (const folder of sorted) {
    const manifestFileId = await findManifestFileId(folder.id);
    if (!manifestFileId) continue;
    const manifest = await fetchManifest(manifestFileId);
    if (!manifest) continue;
    versions.push({
      id: folder.id,
      name: folder.name,
      createdAt: manifest.createdAt,
      device: manifest.device,
      totalBytes: manifest.totalBytes,
      fileCount: manifest.fileCount,
    });
  }
  return versions;
}

async function fetchLatestManifest(driveFolderId: string): Promise<BackupManifest | null> {
  const { folders } = await drive.listFolders(driveFolderId);
  const sorted = [...folders].sort((a, b) => b.name.localeCompare(a.name));
  for (const folder of sorted) {
    const manifestFileId = await findManifestFileId(folder.id);
    if (!manifestFileId) continue;
    const manifest = await fetchManifest(manifestFileId);
    if (manifest) return manifest;
  }
  return null;
}

export async function fetchVersionManifest(versionId: string): Promise<BackupManifest> {
  const manifestFileId = await findManifestFileId(versionId);
  if (!manifestFileId) throw new Error('This version is missing its manifest and cannot be used');
  const manifest = await fetchManifest(manifestFileId);
  if (!manifest) throw new Error('Failed to read this version’s manifest');
  return manifest;
}

export async function deleteVersion(versionId: string): Promise<void> {
  await drive.deleteFile(versionId);
}

export async function runBackup(game: Game, onProgress: (progress: TransferProgress) => void): Promise<{ version: string; status: 'success' | 'failed' }> {
  const gameId = game.id;
  if (!game.driveFolderId) throw new Error('This game has no Drive folder configured');

  const emit = (partial: Omit<TransferProgress, 'gameId' | 'op'>): void => {
    onProgress({ gameId, op: 'backup', ...partial });
  };

  try {
    emit({ phase: 'scanning', filesDone: 0, filesTotal: 0, bytesDone: 0, bytesTotal: 0 });
    const absoluteFiles = await walk(game.localPath);
    const sizes = await Promise.all(absoluteFiles.map(async (f) => (await stat(f)).size));
    const bytesTotal = sizes.reduce((a, b) => a + b, 0);
    const filesTotal = absoluteFiles.length;

    const scanned: ScannedFile[] = [];
    let hashedBytes = 0;
    for (let i = 0; i < absoluteFiles.length; i++) {
      const absolutePath = absoluteFiles[i];
      const relativePath = toPosix(path.relative(game.localPath, absolutePath));
      const size = sizes[i];
      const sha256 = await hashFile(absolutePath, (chunkBytes) => {
        hashedBytes += chunkBytes;
        emit({ phase: 'scanning', currentFile: relativePath, filesDone: i, filesTotal, bytesDone: hashedBytes, bytesTotal });
      });
      scanned.push({ relativePath, absolutePath, size, sha256 });
    }

    emit({ phase: 'diffing', filesDone: filesTotal, filesTotal, bytesDone: hashedBytes, bytesTotal });
    const settings = await settingsModule.get();
    const previousManifest = settings.incrementalBackupEnabled ? await fetchLatestManifest(game.driveFolderId) : null;
    const previousByPath = new Map((previousManifest?.files ?? []).map((f) => [f.path, f] as const));

    const versionName = formatVersionName(new Date());
    const versionFolder = await drive.createFolder(versionName, game.driveFolderId);
    const dirCache = new Map<string, string>();

    const manifestFiles: BackupManifestFileEntry[] = [];
    let bytesDone = 0;
    for (let i = 0; i < scanned.length; i++) {
      const file = scanned[i];
      const dir = path.posix.dirname(file.relativePath);
      const parentId = await ensureDriveDir(dir === '.' ? '' : dir, versionFolder.id, dirCache);
      const baseName = path.posix.basename(file.relativePath);
      const previous = previousByPath.get(file.relativePath);

      let fileId: string;
      if (previous && previous.size === file.size && previous.sha256 === file.sha256) {
        emit({ phase: 'copying', currentFile: file.relativePath, filesDone: i, filesTotal, bytesDone, bytesTotal });
        const copied = await drive.copyFile(previous.fileId, { name: baseName, parents: [parentId] });
        fileId = copied.id;
      } else {
        const uploaded = await drive.uploadFile(file.absolutePath, { name: baseName, parents: [parentId] }, (sent) => {
          emit({ phase: 'uploading', currentFile: file.relativePath, filesDone: i, filesTotal, bytesDone: bytesDone + sent, bytesTotal });
        });
        fileId = uploaded.id;
      }
      bytesDone += file.size;
      manifestFiles.push({ path: file.relativePath, size: file.size, sha256: file.sha256, fileId });
      emit({ phase: previous ? 'copying' : 'uploading', filesDone: i + 1, filesTotal, bytesDone, bytesTotal });
    }

    emit({ phase: 'finalizing', filesDone: filesTotal, filesTotal, bytesDone, bytesTotal });
    const manifest: BackupManifest = {
      schemaVersion: 1,
      version: versionName,
      createdAt: new Date().toISOString(),
      device: hostname(),
      status: 'complete',
      totalBytes: bytesDone,
      fileCount: filesTotal,
      files: manifestFiles,
    };
    await drive.uploadBuffer(Buffer.from(JSON.stringify(manifest)), {
      name: 'manifest.json',
      parents: [versionFolder.id],
      mimeType: 'application/json',
    });

    await games.recordBackupResult(gameId, { lastBackupAt: manifest.createdAt, lastBackupStatus: 'success' });
    emit({ phase: 'done', filesDone: filesTotal, filesTotal, bytesDone, bytesTotal });
    return { version: versionName, status: 'success' };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    emit({ phase: 'error', filesDone: 0, filesTotal: 0, bytesDone: 0, bytesTotal: 0, error: message });
    await games.recordBackupResult(gameId, { lastBackupAt: game.lastBackupAt, lastBackupStatus: 'failed' }).catch(() => undefined);
    throw error;
  }
}
