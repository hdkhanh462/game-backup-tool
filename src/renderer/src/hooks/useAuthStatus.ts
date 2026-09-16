import { toast } from '@renderer/components/ui/toast';
import { api } from '@renderer/lib/api';
import type { AuthStatus } from '@shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const AUTH_STATUS_KEY = ['auth', 'status'] as const;

const DISCONNECTED: AuthStatus = {
  state: 'disconnected',
  email: null,
  rootFolderId: null,
  rootFolderPath: null,
};

export function useAuthStatus(): {
  status: AuthStatus;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  setRootFolder: (folder: { id: string; path: string }) => Promise<void>;
} {
  const queryClient = useQueryClient();

  const { data: status = DISCONNECTED } = useQuery({
    queryKey: AUTH_STATUS_KEY,
    queryFn: async () => {
      const next = await api.auth.getStatus();
      if (next.state === 'error' && next.error) {
        toast.add({ title: 'Google Drive connection error', description: next.error, type: 'error' });
      }
      return next;
    },
  });

  const connectMutation = useMutation({
    mutationFn: () => api.auth.connect(),
    onMutate: () => {
      queryClient.setQueryData<AuthStatus>(AUTH_STATUS_KEY, (prev) => ({ ...(prev ?? DISCONNECTED), state: 'connecting' }));
    },
    onSuccess: (next) => {
      queryClient.setQueryData(AUTH_STATUS_KEY, next);
      if (next.state === 'error' && next.error) {
        toast.add({ title: 'Failed to connect to Google Drive', description: next.error, type: 'error' });
      } else if (next.state === 'connected') {
        toast.add({ title: `Connected as ${next.email}`, type: 'success' });
      }
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: () => api.auth.disconnect(),
    onSuccess: () => {
      queryClient.setQueryData(AUTH_STATUS_KEY, DISCONNECTED);
      toast.add({ title: 'Disconnected from Google Drive', type: 'info' });
    },
  });

  const setRootFolderMutation = useMutation({
    mutationFn: (folder: { id: string; path: string }) => api.auth.setRootFolder(folder),
    onSuccess: (next) => {
      queryClient.setQueryData(AUTH_STATUS_KEY, next);
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
