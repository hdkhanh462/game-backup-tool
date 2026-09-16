import type { AppSettings } from '@shared/types';
import type { UseMutateFunction } from '@tanstack/react-query';

export interface UseSettingsResult {
  settings: AppSettings;
  isLoading: boolean;
  updateSettings: UseMutateFunction<AppSettings, Error, Partial<AppSettings>>;
}
