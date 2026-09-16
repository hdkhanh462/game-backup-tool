import { queryClient } from '@renderer/lib/queryClient';
import type { AppSettings } from '@shared/types';
import type { UseMutationOptions } from '@tanstack/react-query';

import { settingsApi } from './api';
import { settingsKeys } from './queries';

export const settingsMutations = {
  update: (): UseMutationOptions<AppSettings, Error, Partial<AppSettings>> => ({
    mutationFn: (patch) => settingsApi.update(patch),
    onSuccess: (updated) => {
      queryClient.setQueryData(settingsKeys.all, updated);
    },
  }),
};
