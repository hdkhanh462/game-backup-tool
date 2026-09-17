import i18next from '@renderer/lib/i18n';
import { useEffect } from 'react';

import { useSettings } from './useSettings';

export function useLocale(): void {
  const { settings } = useSettings();

  useEffect(() => {
    const language = settings.language ?? 'en';
    if (i18next.language !== language) {
      i18next.changeLanguage(language);
    }
  }, [settings.language]);
}
