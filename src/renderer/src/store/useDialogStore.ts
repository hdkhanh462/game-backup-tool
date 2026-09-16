import type { DialogState } from '@renderer/types/dialog-store.type';
import { create } from 'zustand';

export const useDialogStore = create<DialogState>((set) => ({
  gameDialog: { open: false, game: null },
  openAddGameDialog: () => set({ gameDialog: { open: true, game: null } }),
  openEditGameDialog: (game) => set({ gameDialog: { open: true, game } }),
  closeGameDialog: () => set((state) => ({ gameDialog: { ...state.gameDialog, open: false } })),

  driveFolderPicker: null,
  openDriveFolderPicker: (request) => set({ driveFolderPicker: request }),
  closeDriveFolderPicker: () => set({ driveFolderPicker: null }),
}));
