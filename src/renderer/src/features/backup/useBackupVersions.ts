import { useMutation, useQuery } from '@tanstack/react-query';

import { backupVersionsMutations } from './mutations';
import { backupVersionsQueries } from './queries';
import type { UseBackupVersionsResult } from './types';

export function useBackupVersions(gameId: string, enabled: boolean): UseBackupVersionsResult {
  const { data: versions = [], isLoading, error } = useQuery(backupVersionsQueries.byGame(gameId, enabled));

  const deleteMutation = useMutation(backupVersionsMutations.delete(gameId));

  return {
    versions,
    isLoading,
    error,
    deleteVersion: (versionId) => deleteMutation.mutateAsync(versionId),
    isDeleting: deleteMutation.isPending,
  };
}
