import { api } from '@renderer/lib/api';
import { useOperationStore } from '@renderer/store/useOperationStore';
import type { UseBackupResult } from '@renderer/types/use-backup.type';
import type { RestoreOptions } from '@shared/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useBackup(gameId: string): UseBackupResult {
  const queryClient = useQueryClient();
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
    mutationFn: () => api.backup.run(gameId),
    onMutate: () => setOperation(gameId, { type: 'backup', progress: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['backupVersions', gameId] });
    },
    onSettled: () => setOperation(gameId, null),
  });

  const restoreMutation = useMutation({
    mutationFn: ({ versionId, options }: { versionId: string; options: RestoreOptions }) => api.restore.run(gameId, versionId, options),
    onMutate: () => setOperation(gameId, { type: 'restore', progress: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
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
