import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import { config as loadDotenv } from 'dotenv';
import { app, BrowserWindow, shell } from 'electron';
import { join } from 'path';

import icon from '../../resources/icon.png?asset';
import { tryRestoreSession } from './auth';
import { registerIpcHandlers } from './ipc';

// electron-vite does not inject .env values into process.env for the main process
// (its loadEnv only handles VITE_/MAIN_VITE_-prefixed build-time variables), so load
// it here explicitly for runtime secrets like the Google OAuth client credentials.
loadDotenv();

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.gamebackuptool');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  registerIpcHandlers();
  void tryRestoreSession();

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
