import { create } from 'zustand';

import type { OperationStoreState } from './types';

export const useOperationStore = create<OperationStoreState>((set) => ({
  operations: {},
  setOperation: (gameId, state) => set((prev) => ({ operations: { ...prev.operations, [gameId]: state ?? undefined } })),
}));
