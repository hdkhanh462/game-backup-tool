import { api } from '@renderer/lib/api';
import type { UseBackupVersionsResult } from '@renderer/types/use-backup-versions.type';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useBackupVersions(gameId: string, enabled: boolean): UseBackupVersionsResult {
  const queryClient = useQueryClient();
  const queryKey = ['backupVersions', gameId] as const;

  const {
    data: versions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: () => api.backup.listVersions(gameId),
    enabled,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const deleteMutation = useMutation({
    mutationFn: (versionId: string) => api.backup.deleteVersion(gameId, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    versions,
    isLoading,
    error,
    deleteVersion: (versionId) => deleteMutation.mutateAsync(versionId),
    isDeleting: deleteMutation.isPending,
  };
}
