import type { BackupVersion } from '@shared/types';

export interface UseBackupVersionsResult {
  versions: BackupVersion[];
  isLoading: boolean;
  error: unknown;
  deleteVersion: (versionId: string) => Promise<void>;
  isDeleting: boolean;
}
