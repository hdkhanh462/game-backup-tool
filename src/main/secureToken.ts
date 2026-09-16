import { safeStorage } from 'electron';

import { getStore } from './store';

export async function saveRefreshToken(token: string): Promise<void> {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('OS secure storage is not available on this machine');
  }
  const store = await getStore();
  const enc = safeStorage.encryptString(token);
  store.set('auth.refreshTokenEnc', enc.toString('base64'));
}

export async function loadRefreshToken(): Promise<string | null> {
  const store = await getStore();
  const b64 = store.get('auth.refreshTokenEnc');
  if (!b64) return null;
  if (!safeStorage.isEncryptionAvailable()) return null;
  try {
    return safeStorage.decryptString(Buffer.from(b64, 'base64'));
  } catch {
    return null;
  }
}

export async function clearRefreshToken(): Promise<void> {
  const store = await getStore();
  store.set('auth.refreshTokenEnc', null);
}
