import type { RestoreOptions } from '@shared/types';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';

import { backupApi, restoreApi } from '../api';
import { backupMutations, restoreMutations } from '../mutations';
import { useOperationStore } from '../operationStore';
import type { MutationCallbacks, UseBackupResult } from '../types';

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

  const runBackup: UseBackupResult['runBackup'] = (callbacks) => {
    setOperation(gameId, { type: 'backup', progress: null });
    runMutation.mutate(undefined, {
      onSuccess: callbacks?.onSuccess,
      onError: callbacks?.onError,
      onSettled: () => setOperation(gameId, null),
    });
  };

  const restoreVersion = (versionId: string, options: RestoreOptions, callbacks?: MutationCallbacks<void>): void => {
    setOperation(gameId, { type: 'restore', progress: null });
    restoreMutation.mutate(
      { versionId, options },
      {
        onSuccess: callbacks?.onSuccess,
        onError: callbacks?.onError,
        onSettled: () => setOperation(gameId, null),
      },
    );
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
