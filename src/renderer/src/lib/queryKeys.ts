export const queryKeys = {
  auth: {
    status: () => ['auth', 'status'] as const,
    connect: () => ['auth', 'connect'] as const,
    disconnect: () => ['auth', 'disconnect'] as const,
    setRootFolder: () => ['auth', 'setRootFolder'] as const,
  },
  games: {
    all: () => ['games'] as const,
    add: () => ['games', 'add'] as const,
    update: () => ['games', 'update'] as const,
    remove: () => ['games', 'remove'] as const,
  },
  backup: {
    run: (gameId: string) => ['backup', 'run', gameId] as const,
  },
  restore: {
    run: (gameId: string) => ['restore', 'run', gameId] as const,
  },
  backupVersions: {
    all: (gameId: string) => ['backupVersions', gameId] as const,
    delete: (gameId: string) => ['backupVersions', gameId, 'delete'] as const,
  },
  settings: {
    all: () => ['settings'] as const,
    update: () => ['settings', 'update'] as const,
  },
};
