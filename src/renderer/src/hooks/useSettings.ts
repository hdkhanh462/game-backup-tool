import { api } from '@renderer/lib/api';
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

  const { data: settings = DEFAULT_SETTINGS, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.settings.get(),
  });

  const updateMutation = useMutation({
    mutationFn: (patch: Partial<AppSettings>) => api.settings.update(patch),
    onSuccess: (updated) => {
      queryClient.setQueryData(['settings'], updated);
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: (patch) => updateMutation.mutateAsync(patch),
  };
}
