import { createAuthApi } from './auth.api';
import { createBackupApi } from './backup.api';
import { createDriveApi } from './drive.api';
import { createGamesApi } from './games.api';
import { createRestoreApi } from './restore.api';
import { createSettingsApi } from './settings.api';
import { createSystemApi } from './system.api';

export function createApi() {
  return {
    auth: createAuthApi(),
    drive: createDriveApi(),
    games: createGamesApi(),
    backup: createBackupApi(),
    restore: createRestoreApi(),
    settings: createSettingsApi(),
    system: createSystemApi(),
  };
}

export type Api = ReturnType<typeof createApi>;
