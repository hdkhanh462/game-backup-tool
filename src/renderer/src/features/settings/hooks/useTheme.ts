import { useEffect } from 'react';

import { useSettings } from './useSettings';

export function useTheme(): void {
  const { settings } = useSettings();

  useEffect(() => {
    const root = document.documentElement;

    const applyIsDark = (isDark: boolean): void => {
      root.classList.toggle('dark', isDark);
    };

    if (settings.theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      applyIsDark(media.matches);
      const listener = (event: MediaQueryListEvent): void => applyIsDark(event.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }

    applyIsDark(settings.theme === 'dark');
    return undefined;
  }, [settings.theme]);
}
