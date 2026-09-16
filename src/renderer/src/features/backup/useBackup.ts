import type { BackupRunResult, RestoreOptions } from '@shared/types';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';

import { backupApi, restoreApi } from './api';
import { backupMutations, restoreMutations } from './mutations';
import { useOperationStore } from './operationStore';
import type { UseBackupResult } from './types';

export function useBackup(gameId: string): UseBackupResult {
  const setOperation = useOperationStore((state) => state.setOperation);
  const operation = useOperationStore((state) => state.operations[gameId] ?? null);

  useEffect(() => {
    const unsubscribeBackup = backupApi.onProgress((progress) => {
      if (progress.gameId !== gameId) return;
      setOperation(gameId, { type: 'backup', progress });
    });
    const unsubscribeRestore = restoreApi.onProgress((progress) => {
      if (progress.gameId !== gameId) return;
      setOperation(gameId, { type: 'restore', progress });
    });
    return () => {
      unsubscribeBackup();
      unsubscribeRestore();
    };
  }, [gameId, setOperation]);

  const runMutation = useMutation(backupMutations.run(gameId));
  const restoreMutation = useMutation(restoreMutations.run(gameId));

  const runBackup = async (): Promise<BackupRunResult> => {
    setOperation(gameId, { type: 'backup', progress: null });
    try {
      return await runMutation.mutateAsync();
    } finally {
      setOperation(gameId, null);
    }
  };

  const restoreVersion = async (versionId: string, options: RestoreOptions): Promise<void> => {
    setOperation(gameId, { type: 'restore', progress: null });
    try {
      await restoreMutation.mutateAsync({ versionId, options });
    } finally {
      setOperation(gameId, null);
    }
  };

  return {
    operation,
    isBusy: operation !== null,
    isBackupPending: runMutation.isPending,
    isRestorePending: restoreMutation.isPending,
    runBackup,
    restoreVersion,
  };
}
