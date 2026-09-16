import type { DriveFolderPickerRequest } from '@renderer/features/drive/types';
import type { BackupVersion, Game } from '@shared/types';

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

  importGamesDialog: { open: boolean };
  openImportGamesDialog: () => void;
  closeImportGamesDialog: () => void;
}
