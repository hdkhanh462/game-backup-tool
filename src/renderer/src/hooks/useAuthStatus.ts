import { toast } from '@renderer/components/ui/toast';
import { api } from '@renderer/lib/api';
import { queryKeys } from '@renderer/lib/queryKeys';
import { authMutations } from '@renderer/mutations/auth.mutations';
import { authQueries } from '@renderer/queries/auth.queries';
import type { UseAuthStatusResult } from '@renderer/types/use-auth-status.type';
import type { AuthStatus } from '@shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const DISCONNECTED: AuthStatus = {
  state: 'disconnected',
  email: null,
  rootFolderId: null,
  rootFolderPath: null,
};

export function useAuthStatus(): UseAuthStatusResult {
  const queryClient = useQueryClient();

  const { data: status = DISCONNECTED } = useQuery({
    ...authQueries.status(),
    queryFn: async () => {
      const next = await api.auth.getStatus();
      if (next.state === 'error' && next.error) {
        toast.add({ title: 'Google Drive connection error', description: next.error, type: 'error' });
      }
      return next;
    },
  });

  const connectMutation = useMutation({
    ...authMutations.connect(),
    onMutate: () => {
      queryClient.setQueryData<AuthStatus>(queryKeys.auth.status(), (prev) => ({ ...(prev ?? DISCONNECTED), state: 'connecting' }));
    },
    onSuccess: (next) => {
      queryClient.setQueryData(queryKeys.auth.status(), next);
      if (next.state === 'error' && next.error) {
        toast.add({ title: 'Failed to connect to Google Drive', description: next.error, type: 'error' });
      } else if (next.state === 'connected') {
        toast.add({ title: `Connected as ${next.email}`, type: 'success' });
      }
    },
  });

  const disconnectMutation = useMutation({
    ...authMutations.disconnect(),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.auth.status(), DISCONNECTED);
      toast.add({ title: 'Disconnected from Google Drive', type: 'info' });
    },
  });

  const setRootFolderMutation = useMutation({
    ...authMutations.setRootFolder(),
    onSuccess: (next) => {
      queryClient.setQueryData(queryKeys.auth.status(), next);
    },
  });

  return {
    status,
    connect: async () => {
      await connectMutation.mutateAsync();
    },
    disconnect: async () => {
      await disconnectMutation.mutateAsync();
    },
    setRootFolder: async (folder) => {
      await setRootFolderMutation.mutateAsync(folder);
    },
  };
}
