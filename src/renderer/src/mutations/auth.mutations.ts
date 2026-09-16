import { api } from '@renderer/lib/api';
import { queryKeys } from '@renderer/lib/queryKeys';
import { mutationOptions } from '@tanstack/react-query';

export const authMutations = {
  connect: () =>
    mutationOptions({
      mutationKey: queryKeys.auth.connect(),
      mutationFn: () => api.auth.connect(),
    }),
  disconnect: () =>
    mutationOptions({
      mutationKey: queryKeys.auth.disconnect(),
      mutationFn: () => api.auth.disconnect(),
    }),
  setRootFolder: () =>
    mutationOptions({
      mutationKey: queryKeys.auth.setRootFolder(),
      mutationFn: (folder: { id: string; path: string }) => api.auth.setRootFolder(folder),
    }),
};
