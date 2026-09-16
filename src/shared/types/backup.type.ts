export interface BackupVersion {
  id: string;
  name: string;
  createdAt: string;
  device: string;
  totalBytes: number;
  fileCount: number;
}

export interface BackupManifestFileEntry {
  path: string;
  size: number;
  sha256: string;
  fileId: string;
}

export interface BackupManifest {
  schemaVersion: 1;
  version: string;
  createdAt: string;
  device: string;
  status: 'complete';
  totalBytes: number;
  fileCount: number;
  files: BackupManifestFileEntry[];
}

export interface RestoreOptions {
  safetyBackup: boolean;
  deleteExtraneous: boolean;
}

export interface BackupRunResult {
  version: string;
  status: 'success' | 'failed';
}
