import { Button } from '@renderer/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@renderer/components/ui/dropdown-menu';
import { useSettings } from '@renderer/features/settings/hooks/useSettings';
import type { AppSettings } from '@shared/types';
import { LanguagesIcon, MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const THEME_ICONS: Record<AppSettings['theme'], typeof SunIcon> = { light: SunIcon, dark: MoonIcon, system: MonitorIcon };

export function ThemeLanguageMenu(): React.JSX.Element {
  const { t } = useTranslation();
  const { settings, updateSettings } = useSettings();
  const ThemeIcon = THEME_ICONS[settings.theme];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="icon" variant="outline" />}>
          <ThemeIcon />
          <span className="sr-only">{t('theme.label')}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => updateSettings({ theme: 'light' })}>
            <SunIcon data-icon="inline-start" />
            {t('theme.light')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateSettings({ theme: 'dark' })}>
            <MoonIcon data-icon="inline-start" />
            {t('theme.dark')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateSettings({ theme: 'system' })}>
            <MonitorIcon data-icon="inline-start" />
            {t('theme.system')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="icon" variant="outline" />}>
          <LanguagesIcon />
          <span className="sr-only">{t('language.label')}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => updateSettings({ language: 'en' })}>{t('language.en')}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateSettings({ language: 'vi' })}>{t('language.vi')}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
