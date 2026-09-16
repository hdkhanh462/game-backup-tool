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

  backupHistoryDialog: { open: false, game: null },
  openBackupHistoryDialog: (game) => set({ backupHistoryDialog: { open: true, game } }),
  closeBackupHistoryDialog: () => set((state) => ({ backupHistoryDialog: { ...state.backupHistoryDialog, open: false } })),

  restoreConfirmDialog: { open: false, game: null, version: null },
  openRestoreConfirmDialog: (game, version) => set({ restoreConfirmDialog: { open: true, game, version } }),
  closeRestoreConfirmDialog: () => set((state) => ({ restoreConfirmDialog: { ...state.restoreConfirmDialog, open: false } })),

  settingsDialog: { open: false },
  openSettingsDialog: () => set({ settingsDialog: { open: true } }),
  closeSettingsDialog: () => set({ settingsDialog: { open: false } }),
}));
