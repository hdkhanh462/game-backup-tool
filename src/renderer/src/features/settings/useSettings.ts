import { useMutation, useQuery } from '@tanstack/react-query';

import { DEFAULT_SETTINGS } from './constants';
import { settingsMutations } from './mutations';
import { settingsQueries } from './queries';
import type { UseSettingsResult } from './types';

export function useSettings(): UseSettingsResult {
  const { data: settings = DEFAULT_SETTINGS, isLoading } = useQuery(settingsQueries.all());
  const updateMutation = useMutation(settingsMutations.update());

  return {
    settings,
    isLoading,
    updateSettings: (patch) => updateMutation.mutateAsync(patch),
  };
}
