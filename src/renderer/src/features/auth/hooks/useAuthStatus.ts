import { useMutation, useQuery } from '@tanstack/react-query';

import { DISCONNECTED_AUTH_STATUS } from '../constants';
import { authMutations } from '../mutations';
import { authQueries } from '../queries';
import type { UseAuthStatusResult } from '../types';

export function useAuthStatus(): UseAuthStatusResult {
  const { data: status = DISCONNECTED_AUTH_STATUS } = useQuery(authQueries.status());
  const connectMutation = useMutation(authMutations.connect());
  const disconnectMutation = useMutation(authMutations.disconnect());
  const setRootFolderMutation = useMutation(authMutations.setRootFolder());

  return {
    status,
    connect: connectMutation.mutate,
    disconnect: disconnectMutation.mutate,
    setRootFolder: setRootFolderMutation.mutate,
    isDisconnecting: disconnectMutation.isPending,
    isSettingRootFolder: setRootFolderMutation.isPending,
  };
}
