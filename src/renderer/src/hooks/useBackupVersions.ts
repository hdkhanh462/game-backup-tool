import { backupVersionsMutations } from '@renderer/mutations/backupVersions.mutations';
import { backupVersionsQueries } from '@renderer/queries/backupVersions.queries';
import type { UseBackupVersionsResult } from '@renderer/types/use-backup-versions.type';
import { useMutation, useQuery } from '@tanstack/react-query';

export function useBackupVersions(gameId: string, enabled: boolean): UseBackupVersionsResult {
  const {
    data: versions = [],
    isLoading,
    error,
  } = useQuery({
    ...backupVersionsQueries.byGame(gameId),
    enabled,
  });

  const deleteMutation = useMutation(backupVersionsMutations.delete(gameId));

  return {
    versions,
    isLoading,
    error,
    deleteVersion: (versionId) => deleteMutation.mutateAsync(versionId),
    isDeleting: deleteMutation.isPending,
  };
}
