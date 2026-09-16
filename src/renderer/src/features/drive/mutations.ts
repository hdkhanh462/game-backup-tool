import { queryClient } from '@renderer/lib/queryClient';
import { mutationOptions } from '@tanstack/react-query';

import { driveApi } from './api';
import { driveKeys } from './queries';

export const driveMutations = {
  createFolder: (parentId: string) =>
    mutationOptions({
      mutationKey: ['drive', 'createFolder', parentId],
      mutationFn: (name: string) => driveApi.createFolder(name, parentId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: driveKeys.folders(parentId) });
      },
    }),
};
