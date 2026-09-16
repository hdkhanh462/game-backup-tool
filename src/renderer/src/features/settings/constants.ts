import type { AppSettings } from '@shared/types';

export const DEFAULT_SETTINGS: AppSettings = {
  incrementalBackupEnabled: true,
  confirmBeforeOverwrite: true,
  safetyBackupBeforeRestore: true,
  theme: 'system',
  language: 'en',
};
