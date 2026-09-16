import { toast } from '@renderer/components/ui/toast';
import { queryClient } from '@renderer/lib/queryClient';
import type { AuthStatus } from '@shared/types';
import { mutationOptions } from '@tanstack/react-query';

import { authApi } from './api';
import { DISCONNECTED_AUTH_STATUS } from './constants';
import { authKeys } from './queries';

export const authMutations = {
  connect: () =>
    mutationOptions({
      mutationKey: ['auth', 'connect'],
      mutationFn: () => authApi.connect(),
      onMutate: () => {
        queryClient.setQueryData<AuthStatus>(authKeys.status(), (prev) => ({ ...(prev ?? DISCONNECTED_AUTH_STATUS), state: 'connecting' }));
      },
      onSuccess: (next) => {
        queryClient.setQueryData(authKeys.status(), next);
        if (next.state === 'error' && next.error) {
          toast.add({ title: 'Failed to connect to Google Drive', description: next.error, type: 'error' });
        } else if (next.state === 'connected') {
          toast.add({ title: `Connected as ${next.email}`, type: 'success' });
        }
      },
    }),
  disconnect: () =>
    mutationOptions({
      mutationKey: ['auth', 'disconnect'],
      mutationFn: () => authApi.disconnect(),
      onSuccess: () => {
        queryClient.setQueryData(authKeys.status(), DISCONNECTED_AUTH_STATUS);
        toast.add({ title: 'Disconnected from Google Drive', type: 'info' });
      },
    }),
  setRootFolder: () =>
    mutationOptions({
      mutationKey: ['auth', 'setRootFolder'],
      mutationFn: (folder: { id: string; path: string }) => authApi.setRootFolder(folder),
      onSuccess: (next) => {
        queryClient.setQueryData(authKeys.status(), next);
      },
    }),
};
