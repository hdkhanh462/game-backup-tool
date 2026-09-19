import { queryClient } from '@renderer/lib/queryClient';
import type { DriveFolder } from '@shared/types';
import type { UseMutationOptions } from '@tanstack/react-query';

import { driveApi } from './api';
import { driveKeys } from './queries';

export const driveMutations = {
  createFolder: (parentId: string): UseMutationOptions<DriveFolder, Error, string> => ({
    mutationFn: (name) => driveApi.createFolder(name, parentId),
    onSuccess: (folder) => {
      queryClient.setQueryData<DriveFolder[]>(driveKeys.folders(parentId), (prev) => [...(prev ?? []).filter((f) => f.id !== folder.id), folder]);
    },
  }),
};
