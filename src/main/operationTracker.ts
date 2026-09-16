import type { TransferProgress } from '../shared/types';

const operations = new Map<string, TransferProgress>();

export function isBusy(gameId: string): boolean {
  return operations.has(gameId);
}

export function setOperation(gameId: string, progress: TransferProgress): void {
  operations.set(gameId, progress);
}

export function clearOperation(gameId: string): void {
  operations.delete(gameId);
}

export function listOperations(): TransferProgress[] {
  return Array.from(operations.values());
}
