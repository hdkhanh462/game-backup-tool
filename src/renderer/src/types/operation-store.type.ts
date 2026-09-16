import type { TransferOp, TransferProgress } from '@shared/types';

export interface OperationState {
  type: TransferOp;
  progress: TransferProgress | null;
}

export interface OperationStoreState {
  operations: Record<string, OperationState | undefined>;
  setOperation: (gameId: string, state: OperationState | null) => void;
}
