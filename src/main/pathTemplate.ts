import { app } from 'electron';
import os from 'os';
import path from 'path';

const isWindows = process.platform === 'win32';

function builtinVariables(): Record<string, string> {
  const vars: Record<string, string> = {
    HOME: os.homedir(),
    USERPROFILE: os.homedir(),
    DOCUMENTS: app.getPath('documents'),
    DESKTOP: app.getPath('desktop'),
    APPDATA: app.getPath('appData'),
  };
  if (isWindows) {
    vars.LOCALAPPDATA = process.env.LOCALAPPDATA ?? path.join(os.homedir(), 'AppData', 'Local');
    vars.SAVEDGAMES = path.join(os.homedir(), 'Saved Games');
  }
  return vars;
}

function lookup(name: string): string | undefined {
  const upper = name.toUpperCase();
  const builtin = builtinVariables()[upper];
  if (builtin) return builtin;
  const key = Object.keys(process.env).find((k) => k.toUpperCase() === upper);
  return key ? process.env[key] : undefined;
}

/** Expands %VAR%, ${VAR}, $VAR and a leading ~ . Throws if a placeholder cannot be resolved. */
export function expandPath(template: string): string {
  const missing: string[] = [];
  const replace = (name: string): string => {
    const value = lookup(name);
    if (value === undefined) {
      missing.push(name);
      return '';
    }
    return value;
  };

  let result = template.trim();
  if (result === '~' || result.startsWith('~/') || result.startsWith('~\\')) result = os.homedir() + result.slice(1);
  result = result
    .replace(/%([^%\\/]+)%/g, (_m, name: string) => replace(name))
    .replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_m, name: string) => replace(name))
    .replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, (_m, name: string) => replace(name));

  if (missing.length > 0) throw new Error(`Unknown path variable: ${[...new Set(missing)].map((n) => `%${n}%`).join(', ')}`);
  return path.normalize(result);
}

/** Replaces a leading well-known folder with its placeholder (longest match wins). Returns the input unchanged if none match. */
export function collapsePath(absolutePath: string): string {
  const normalize = (p: string): string => (isWindows ? path.normalize(p).toLowerCase() : path.normalize(p));
  const target = normalize(absolutePath);

  let best: { name: string; length: number } | null = null;
  for (const [name, value] of Object.entries(builtinVariables())) {
    if (name === 'HOME') continue; // USERPROFILE covers it; keep one canonical placeholder
    const base = normalize(value).replace(/[\\/]+$/, '');
    if (!base) continue;
    const matches = target === base || target.startsWith(base + path.sep);
    if (matches && (!best || base.length > best.length)) best = { name, length: base.length };
  }
  if (!best) return absolutePath;
  return `%${best.name}%${absolutePath.slice(best.length)}`;
}
