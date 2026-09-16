import { queryKeys } from '@renderer/lib/queryKeys';
import { settingsMutations } from '@renderer/mutations/settings.mutations';
import { settingsQueries } from '@renderer/queries/settings.queries';
import type { UseSettingsResult } from '@renderer/types/use-settings.type';
import type { AppSettings } from '@shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const DEFAULT_SETTINGS: AppSettings = {
  incrementalBackupEnabled: true,
  confirmBeforeOverwrite: true,
  safetyBackupBeforeRestore: true,
  theme: 'system',
  language: 'en',
};

export function useSettings(): UseSettingsResult {
  const queryClient = useQueryClient();

  const { data: settings = DEFAULT_SETTINGS, isLoading } = useQuery(settingsQueries.all());

  const updateMutation = useMutation({
    ...settingsMutations.update(),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.settings.all(), updated);
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: (patch) => updateMutation.mutateAsync(patch),
  };
}
