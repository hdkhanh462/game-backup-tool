import type { DriveFolder } from '@shared/types';
import type { UseMutationOptions } from '@tanstack/react-query';

import { driveApi } from './api';
import { driveKeys } from './queries';

export const driveMutations = {
  createFolder: (parentId: string): UseMutationOptions<DriveFolder, Error, string> => ({
    mutationFn: (name) => driveApi.createFolder(name, parentId),
    meta: { invalidateQueries: driveKeys.folders(parentId) },
  }),
};
