import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import type { Readable } from 'stream';
import { PassThrough } from 'stream';

import type { DriveFolder, DriveListFoldersResult } from '../shared/types';
import { ensureFreshAccessToken } from './auth';
import type { DriveFile } from './types/drive.type';

function attachAuthInterceptor(client: AxiosInstance): void {
  client.interceptors.request.use(async (config) => {
    const token = await ensureFreshAccessToken();
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
}

function attachRetryInterceptor(client: AxiosInstance): void {
  client.interceptors.response.use(undefined, async (error) => {
    const config = error.config as (Parameters<AxiosInstance>[0] & { __retryCount?: number }) | undefined;
    const status = error.response?.status;
    if (!config || (status !== 429 && status !== 403)) throw error;
    config.__retryCount = (config.__retryCount ?? 0) + 1;
    if (config.__retryCount > 3) throw error;
    const delay = 300 * 2 ** config.__retryCount + Math.random() * 200;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return client(config);
  });
}

const driveClient = axios.create({ baseURL: 'https://www.googleapis.com/drive/v3' });
attachAuthInterceptor(driveClient);
attachRetryInterceptor(driveClient);

const uploadClient = axios.create({ baseURL: 'https://www.googleapis.com/upload/drive/v3' });
attachAuthInterceptor(uploadClient);
attachRetryInterceptor(uploadClient);

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

export async function listFiles(parentId: string): Promise<DriveFile[]> {
  const q = `mimeType!='application/vnd.google-apps.folder' and trashed=false and '${parentId}' in parents`;
  const { data } = await driveClient.get<{ files: DriveFile[] }>('/files', {
    params: { q, fields: 'files(id,name,size,mimeType)', pageSize: 1000 },
  });
  return data.files ?? [];
}

export async function uploadFile(localPath: string, meta: { name: string; parents: string[] }, onProgress?: (bytesSent: number, totalBytes: number) => void): Promise<DriveFile> {
  const fileStat = await stat(localPath);
  const boundary = `boundary_${randomUUID()}`;
  const metadataPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`;
  const closingPart = `\r\n--${boundary}--`;
  const totalBytes = Buffer.byteLength(metadataPart) + fileStat.size + Buffer.byteLength(closingPart);

  const body = new PassThrough();
  body.write(metadataPart);
  const fileStream = createReadStream(localPath);
  fileStream.pipe(body, { end: false });
  fileStream.on('end', () => body.end(closingPart));
  fileStream.on('error', (err) => body.destroy(err));

  const { data } = await uploadClient.post<DriveFile>('/files', body, {
    params: { uploadType: 'multipart' },
    headers: {
      'Content-Type': `multipart/related; boundary=${boundary}`,
      'Content-Length': totalBytes,
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    onUploadProgress: (event) => onProgress?.(event.loaded, event.total ?? totalBytes),
  });
  return data;
}

export async function uploadBuffer(buffer: Buffer, meta: { name: string; parents: string[]; mimeType?: string }): Promise<DriveFile> {
  const boundary = `boundary_${randomUUID()}`;
  const metadataPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name: meta.name, parents: meta.parents })}\r\n--${boundary}\r\nContent-Type: ${meta.mimeType ?? 'application/octet-stream'}\r\n\r\n`;
  const closingPart = `\r\n--${boundary}--`;
  const body = Buffer.concat([Buffer.from(metadataPart), buffer, Buffer.from(closingPart)]);
  const { data } = await uploadClient.post<DriveFile>('/files', body, {
    params: { uploadType: 'multipart' },
    headers: {
      'Content-Type': `multipart/related; boundary=${boundary}`,
      'Content-Length': body.length,
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
  return data;
}

export async function downloadFileStream(fileId: string): Promise<Readable> {
  const res = await driveClient.get<Readable>(`/files/${fileId}`, {
    params: { alt: 'media' },
    responseType: 'stream',
  });
  return res.data;
}

export async function downloadFileContent(fileId: string): Promise<Buffer> {
  const res = await driveClient.get<ArrayBuffer>(`/files/${fileId}`, {
    params: { alt: 'media' },
    responseType: 'arraybuffer',
  });
  return Buffer.from(res.data);
}

export async function copyFile(fileId: string, meta: { name: string; parents: string[] }): Promise<DriveFile> {
  const { data } = await driveClient.post<DriveFile>(`/files/${fileId}/copy`, meta);
  return data;
}

export async function deleteFile(fileId: string): Promise<void> {
  await driveClient.delete(`/files/${fileId}`);
}

export async function getAbout(): Promise<{ usage: number; limit: number | null }> {
  const { data } = await driveClient.get<{ storageQuota: { usage: string; limit?: string } }>('/about', {
    params: { fields: 'storageQuota' },
  });
  return {
    usage: Number(data.storageQuota.usage),
    limit: data.storageQuota.limit ? Number(data.storageQuota.limit) : null,
  };
}
