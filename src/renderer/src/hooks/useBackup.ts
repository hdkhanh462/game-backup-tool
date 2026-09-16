import { api } from '@renderer/lib/api';
import { backupMutations } from '@renderer/mutations/backup.mutations';
import { restoreMutations } from '@renderer/mutations/restore.mutations';
import { useOperationStore } from '@renderer/store/useOperationStore';
import type { UseBackupResult } from '@renderer/types/use-backup.type';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useBackup(gameId: string): UseBackupResult {
  const setOperation = useOperationStore((state) => state.setOperation);
  const operation = useOperationStore((state) => state.operations[gameId] ?? null);

  useEffect(() => {
    const unsubscribeBackup = api.backup.onProgress((progress) => {
      if (progress.gameId !== gameId) return;
      setOperation(gameId, { type: 'backup', progress });
    });
    const unsubscribeRestore = api.restore.onProgress((progress) => {
      if (progress.gameId !== gameId) return;
      setOperation(gameId, { type: 'restore', progress });
    });
    return () => {
      unsubscribeBackup();
      unsubscribeRestore();
    };
  }, [gameId, setOperation]);

  const runMutation = useMutation({
    ...backupMutations.run(gameId),
    onMutate: () => setOperation(gameId, { type: 'backup', progress: null }),
    onSettled: () => setOperation(gameId, null),
  });

  const restoreMutation = useMutation({
    ...restoreMutations.run(gameId),
    onMutate: () => setOperation(gameId, { type: 'restore', progress: null }),
    onSettled: () => setOperation(gameId, null),
  });

  return {
    operation,
    isBusy: operation !== null,
    isBackupPending: runMutation.isPending,
    isRestorePending: restoreMutation.isPending,
    runBackup: () => runMutation.mutateAsync(),
    restoreVersion: (versionId, options) => restoreMutation.mutateAsync({ versionId, options }),
  };
}
