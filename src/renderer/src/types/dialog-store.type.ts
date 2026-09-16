import type { Game } from '@shared/types';

import type { DriveFolderPickerRequest } from './drive-folder-picker.type';

export interface DialogState {
  gameDialog: { open: boolean; game: Game | null };
  openAddGameDialog: () => void;
  openEditGameDialog: (game: Game) => void;
  closeGameDialog: () => void;

  driveFolderPicker: DriveFolderPickerRequest | null;
  openDriveFolderPicker: (request: DriveFolderPickerRequest) => void;
  closeDriveFolderPicker: () => void;
}
