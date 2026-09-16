import type { Game } from '@shared/types';
import { create } from 'zustand';

interface DriveFolderPickerRequest {
  startParentId?: string;
  startPath?: string;
  onSelect: (folder: { id: string; path: string }) => void | Promise<void>;
}

interface DialogState {
  gameDialog: { open: boolean; game: Game | null };
  openAddGameDialog: () => void;
  openEditGameDialog: (game: Game) => void;
  closeGameDialog: () => void;

  driveFolderPicker: DriveFolderPickerRequest | null;
  openDriveFolderPicker: (request: DriveFolderPickerRequest) => void;
  closeDriveFolderPicker: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  gameDialog: { open: false, game: null },
  openAddGameDialog: () => set({ gameDialog: { open: true, game: null } }),
  openEditGameDialog: (game) => set({ gameDialog: { open: true, game } }),
  closeGameDialog: () => set((state) => ({ gameDialog: { ...state.gameDialog, open: false } })),

  driveFolderPicker: null,
  openDriveFolderPicker: (request) => set({ driveFolderPicker: request }),
  closeDriveFolderPicker: () => set({ driveFolderPicker: null }),
}));
