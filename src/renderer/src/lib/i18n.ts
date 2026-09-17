import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import backupEn from '../locales/en/backup.json';
import commonEn from '../locales/en/common.json';
import driveEn from '../locales/en/drive.json';
import gamesEn from '../locales/en/games.json';
import settingsEn from '../locales/en/settings.json';
import backupVi from '../locales/vi/backup.json';
import commonVi from '../locales/vi/common.json';
import driveVi from '../locales/vi/drive.json';
import gamesVi from '../locales/vi/games.json';
import settingsVi from '../locales/vi/settings.json';

const resources = {
  en: { common: commonEn, games: gamesEn, backup: backupEn, drive: driveEn, settings: settingsEn },
  vi: { common: commonVi, games: gamesVi, backup: backupVi, drive: driveVi, settings: settingsVi },
};

void i18next.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

export default i18next;
