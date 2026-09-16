import type { AppSettings } from '@shared/types';

export interface UseSettingsResult {
  settings: AppSettings;
  isLoading: boolean;
  updateSettings: (patch: Partial<AppSettings>) => Promise<AppSettings>;
}
