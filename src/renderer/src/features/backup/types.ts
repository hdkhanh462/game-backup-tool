import type { BackupRunResult, BackupVersion, RestoreOptions, TransferOp, TransferProgress } from '@shared/types';
import type { UseMutateFunction } from '@tanstack/react-query';

export interface OperationState {
  type: TransferOp;
  progress: TransferProgress | null;
}

export interface OperationStoreState {
  operations: Record<string, OperationState | undefined>;
  setOperation: (gameId: string, state: OperationState | null) => void;
}

export interface MutationCallbacks<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

export interface RestoreVersionInput {
  versionId: string;
  options: RestoreOptions;
}

export interface UseBackupResult {
  operation: OperationState | null;
  isBusy: boolean;
  isBackupPending: boolean;
  isRestorePending: boolean;
  runBackup: (callbacks?: MutationCallbacks<BackupRunResult>) => void;
  restoreVersion: (versionId: string, options: RestoreOptions, callbacks?: MutationCallbacks<void>) => void;
}

export interface UseBackupVersionsResult {
  versions: BackupVersion[];
  isLoading: boolean;
  error: unknown;
  deleteVersion: UseMutateFunction<void, Error, string>;
  isDeleting: boolean;
}
