import type { AuthStatus } from '@shared/types';

export interface UseAuthStatusResult {
  status: AuthStatus;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  setRootFolder: (folder: { id: string; path: string }) => Promise<void>;
}
