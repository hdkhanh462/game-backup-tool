import type { default as StoreType } from 'electron-store';

import type { StoreSchema } from './types/store.type';

let storePromise: Promise<StoreType<StoreSchema>> | null = null;

// electron-store v11+ ships as pure ESM; the main process bundles to CommonJS,
// so it must be loaded via dynamic import() rather than a static import.
export function getStore(): Promise<StoreType<StoreSchema>> {
  if (!storePromise) {
    storePromise = import('electron-store').then(({ default: Store }) => {
      return new Store<StoreSchema>({
        defaults: {
          games: [],
          auth: {
            email: null,
            rootFolderId: null,
            rootFolderPath: null,
            connectedAt: null,
            refreshTokenEnc: null,
          },
        },
      });
    });
  }
  return storePromise;
}
