import type { BackupRunResult, BackupVersion, RestoreOptions, TransferOp, TransferProgress } from '@shared/types';

export interface OperationState {
  type: TransferOp;
  progress: TransferProgress | null;
}

export interface OperationStoreState {
  operations: Record<string, OperationState | undefined>;
  setOperation: (gameId: string, state: OperationState | null) => void;
}

export interface UseBackupResult {
  operation: OperationState | null;
  isBusy: boolean;
  isBackupPending: boolean;
  isRestorePending: boolean;
  runBackup: () => Promise<BackupRunResult>;
  restoreVersion: (versionId: string, options: RestoreOptions) => Promise<void>;
}

export interface UseBackupVersionsResult {
  versions: BackupVersion[];
  isLoading: boolean;
  error: unknown;
  deleteVersion: (versionId: string) => Promise<void>;
  isDeleting: boolean;
}
