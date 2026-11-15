import type { DriveFolderSelection } from '@renderer/features/drive/types';
import type { AuthStatus } from '@shared/types';
import type { UseMutateFunction } from '@tanstack/react-query';

export interface UseAuthStatusResult {
  status: AuthStatus;
  connect: UseMutateFunction<AuthStatus, Error, void>;
  cancelConnect: () => void;
  copyAuthUrl: () => Promise<boolean>;
  disconnect: UseMutateFunction<void, Error, void>;
  setRootFolder: UseMutateFunction<AuthStatus, Error, DriveFolderSelection>;
  isDisconnecting: boolean;
  isSettingRootFolder: boolean;
}
