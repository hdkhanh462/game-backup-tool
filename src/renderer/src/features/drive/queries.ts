import { queryOptions } from '@tanstack/react-query';

import { driveApi } from './api';

export const driveKeys = {
  folders: (parentId: string) => ['drive', 'folders', parentId] as const,
};

export const driveQueries = {
  folders: (parentId: string, enabled: boolean) =>
    queryOptions({
      queryKey: driveKeys.folders(parentId),
      queryFn: () => driveApi.listFolders(parentId).then((res) => res.folders),
      enabled,
    }),
};
