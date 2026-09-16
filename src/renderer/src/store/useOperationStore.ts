import type { OperationStoreState } from '@renderer/types/operation-store.type';
import { create } from 'zustand';

export const useOperationStore = create<OperationStoreState>((set) => ({
  operations: {},
  setOperation: (gameId, state) => set((prev) => ({ operations: { ...prev.operations, [gameId]: state ?? undefined } })),
}));
