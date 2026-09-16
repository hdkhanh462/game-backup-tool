import axios from 'axios';

import type { DriveFolder, DriveListFoldersResult } from '../shared/types';
import { ensureFreshAccessToken } from './auth';

const driveClient = axios.create({ baseURL: 'https://www.googleapis.com/drive/v3' });

driveClient.interceptors.request.use(async (config) => {
  const token = await ensureFreshAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function listFolders(parentId: string): Promise<DriveListFoldersResult> {
  const parent = parentId || 'root';
  const q = `mimeType='application/vnd.google-apps.folder' and trashed=false and '${parent}' in parents`;
  const { data } = await driveClient.get<{ files: DriveFolder[] }>('/files', {
    params: { q, fields: 'files(id,name)', pageSize: 200 },
  });
  return { parentId: parent, folders: data.files ?? [] };
}

export async function createFolder(name: string, parentId: string): Promise<DriveFolder> {
  const { data } = await driveClient.post<DriveFolder>('/files', {
    name,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentId || 'root'],
  });
  return data;
}
