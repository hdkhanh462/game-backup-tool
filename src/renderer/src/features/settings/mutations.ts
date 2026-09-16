import { queryClient } from '@renderer/lib/queryClient';
import type { AppSettings } from '@shared/types';
import { mutationOptions } from '@tanstack/react-query';

import { settingsApi } from './api';
import { settingsKeys } from './queries';

export const settingsMutations = {
  update: () =>
    mutationOptions({
      mutationKey: ['settings', 'update'],
      mutationFn: (patch: Partial<AppSettings>) => settingsApi.update(patch),
      onSuccess: (updated) => {
        queryClient.setQueryData(settingsKeys.all, updated);
      },
    }),
};
