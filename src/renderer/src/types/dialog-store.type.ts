import type { BackupVersion, Game } from '@shared/types';

import type { DriveFolderPickerRequest } from './drive-folder-picker.type';

export interface DialogState {
  gameDialog: { open: boolean; game: Game | null };
  openAddGameDialog: () => void;
  openEditGameDialog: (game: Game) => void;
  closeGameDialog: () => void;

  driveFolderPicker: DriveFolderPickerRequest | null;
  openDriveFolderPicker: (request: DriveFolderPickerRequest) => void;
  closeDriveFolderPicker: () => void;

  backupHistoryDialog: { open: boolean; game: Game | null };
  openBackupHistoryDialog: (game: Game) => void;
  closeBackupHistoryDialog: () => void;

  restoreConfirmDialog: { open: boolean; game: Game | null; version: BackupVersion | null };
  openRestoreConfirmDialog: (game: Game, version: BackupVersion) => void;
  closeRestoreConfirmDialog: () => void;

  settingsDialog: { open: boolean };
  openSettingsDialog: () => void;
  closeSettingsDialog: () => void;
}
