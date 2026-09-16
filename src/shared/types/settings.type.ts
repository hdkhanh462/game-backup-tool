export interface AppSettings {
  incrementalBackupEnabled: boolean;
  confirmBeforeOverwrite: boolean;
  safetyBackupBeforeRestore: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string | null;
}
