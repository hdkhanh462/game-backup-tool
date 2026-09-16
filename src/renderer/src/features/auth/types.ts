import type { AuthStatus } from '@shared/types';
import type { UseMutateFunction } from '@tanstack/react-query';

export interface UseAuthStatusResult {
  status: AuthStatus;
  connect: UseMutateFunction<AuthStatus, Error, void>;
  disconnect: UseMutateFunction<void, Error, void>;
  setRootFolder: UseMutateFunction<AuthStatus, Error, { id: string; path: string }>;
}
