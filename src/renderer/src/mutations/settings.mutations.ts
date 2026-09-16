import { api } from '@renderer/lib/api';
import { queryKeys } from '@renderer/lib/queryKeys';
import type { AppSettings } from '@shared/types';
import { mutationOptions } from '@tanstack/react-query';

export const settingsMutations = {
  update: () =>
    mutationOptions({
      mutationKey: queryKeys.settings.update(),
      mutationFn: (patch: Partial<AppSettings>) => api.settings.update(patch),
    }),
};
