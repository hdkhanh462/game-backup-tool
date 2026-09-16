import type { BackupRunResult, RestoreOptions } from '@shared/types';

import type { OperationState } from './operation-store.type';

export interface UseBackupResult {
  operation: OperationState | null;
  isBusy: boolean;
  isBackupPending: boolean;
  isRestorePending: boolean;
  runBackup: () => Promise<BackupRunResult>;
  restoreVersion: (versionId: string, options: RestoreOptions) => Promise<void>;
}
