import type { AppSettings } from '../shared/types';
import { getStore } from './store';

export async function get(): Promise<AppSettings> {
  const store = await getStore();
  return store.get('settings');
}

export async function update(patch: Partial<AppSettings>): Promise<AppSettings> {
  const store = await getStore();
  const next = { ...store.get('settings'), ...patch };
  store.set('settings', next);
  return next;
}
