import type { DriveFolder, DriveListFoldersResult } from '../shared/types';
import { ensureFreshAccessToken } from './auth';

const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';

async function driveFetch(url: string, init?: RequestInit): Promise<Response> {
  const token = await ensureFreshAccessToken();
  const res = await fetch(url, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Google Drive request failed (${res.status}): ${text || res.statusText}`);
  }
  return res;
}

export async function listFolders(parentId: string): Promise<DriveListFoldersResult> {
  const parent = parentId || 'root';
  const q = `mimeType='application/vnd.google-apps.folder' and trashed=false and '${parent}' in parents`;
  const url = `${DRIVE_FILES_URL}?q=${encodeURIComponent(q)}&fields=${encodeURIComponent('files(id,name)')}&pageSize=200`;
  const res = await driveFetch(url);
  const data = (await res.json()) as { files: DriveFolder[] };
  return { parentId: parent, folders: data.files ?? [] };
}

export async function createFolder(name: string, parentId: string): Promise<DriveFolder> {
  const res = await driveFetch(DRIVE_FILES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId || 'root'],
    }),
  });
  const data = (await res.json()) as DriveFolder;
  return data;
}
