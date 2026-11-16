import type { GameFilter } from './types';

export const DEFAULT_GAME_FILTER: GameFilter = { mode: 'none', extensions: [] };

export function normalizeExtension(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^\*?\./, '');
}

export function normalizeExtensions(list: string[]): string[] {
  return [...new Set(list.map(normalizeExtension))];
}

/** Parses free text like ".sav, *.dat  log" into a normalized extension list. */
export function parseExtensions(text: string): string[] {
  return normalizeExtensions(text.split(/[\s,;]+/).filter((part) => part !== ''));
}

export function normalizeFilter(filter: Partial<GameFilter> | null | undefined): GameFilter {
  if (!filter || (filter.mode !== 'blacklist' && filter.mode !== 'whitelist')) return { ...DEFAULT_GAME_FILTER };
  return { mode: filter.mode, extensions: normalizeExtensions(filter.extensions ?? []) };
}

export function fileExtension(fileName: string): string {
  const base = fileName.split(/[\\/]/).pop() ?? fileName;
  const dot = base.lastIndexOf('.');
  return dot <= 0 ? '' : base.slice(dot + 1).toLowerCase();
}

export function isFileIncluded(filter: GameFilter, fileName: string): boolean {
  if (filter.mode === 'none') return true;
  const listed = filter.extensions.includes(fileExtension(fileName));
  return filter.mode === 'whitelist' ? listed : !listed;
}
