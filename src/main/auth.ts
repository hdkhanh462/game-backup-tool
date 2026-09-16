import { shell } from 'electron';
import { OAuth2Client } from 'google-auth-library';
import http from 'http';
import type { AddressInfo } from 'net';

import type { AuthStatus } from '../shared/types';
import { clearRefreshToken, loadRefreshToken, saveRefreshToken } from './secureToken';
import { getStore } from './store';

const SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/userinfo.email'];
const CONNECT_TIMEOUT_MS = 2 * 60 * 1000;

let client: OAuth2Client | null = null;
let currentState: AuthStatus = {
  state: 'disconnected',
  email: null,
  rootFolderId: null,
  rootFolderPath: null,
};

function getClientCredentials(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

function createClient(redirectUri?: string): OAuth2Client {
  const credentials = getClientCredentials();
  if (!credentials) {
    throw new Error('Missing OAuth client credentials (GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET)');
  }
  return new OAuth2Client({
    clientId: credentials.clientId,
    clientSecret: credentials.clientSecret,
    redirectUri,
  });
}

async function fetchEmail(activeClient: OAuth2Client): Promise<string | null> {
  try {
    const { token } = await activeClient.getAccessToken();
    if (!token) return null;
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { email?: string };
    return data.email ?? null;
  } catch {
    return null;
  }
}

export function getStatus(): AuthStatus {
  return currentState;
}

export async function ensureFreshAccessToken(): Promise<string> {
  if (!client || currentState.state !== 'connected') {
    throw new Error('Not connected to Google Drive');
  }
  const { token } = await client.getAccessToken();
  if (!token) throw new Error('Failed to obtain a valid access token');
  return token;
}

export async function tryRestoreSession(): Promise<AuthStatus> {
  const credentials = getClientCredentials();
  if (!credentials) {
    currentState = {
      state: 'error',
      email: null,
      rootFolderId: null,
      rootFolderPath: null,
      error: 'Missing OAuth client credentials',
    };
    return currentState;
  }

  const refreshToken = await loadRefreshToken();
  if (!refreshToken) {
    currentState = { state: 'disconnected', email: null, rootFolderId: null, rootFolderPath: null };
    return currentState;
  }

  try {
    const activeClient = createClient();
    activeClient.setCredentials({ refresh_token: refreshToken });
    await activeClient.getAccessToken();
    client = activeClient;

    const store = await getStore();
    const email = (await fetchEmail(activeClient)) ?? store.get('auth.email');
    currentState = {
      state: 'connected',
      email,
      rootFolderId: store.get('auth.rootFolderId'),
      rootFolderPath: store.get('auth.rootFolderPath'),
    };
  } catch {
    await clearRefreshToken();
    currentState = { state: 'disconnected', email: null, rootFolderId: null, rootFolderPath: null };
  }

  return currentState;
}

export async function connect(): Promise<AuthStatus> {
  currentState = { ...currentState, state: 'connecting' };

  try {
    const result = await new Promise<AuthStatus>((resolvePromise, rejectPromise) => {
      let settled = false;

      const server = http.createServer((req, res) => {
        if (!req.url) return;
        const url = new URL(req.url, 'http://127.0.0.1');
        if (url.pathname !== '/oauth2callback') {
          res.writeHead(404).end();
          return;
        }

        const code = url.searchParams.get('code');
        const errorParam = url.searchParams.get('error');

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<html><body>You can close this window and return to the app.</body></html>');

        clearTimeout(timeout);
        server.close();

        if (settled) return;
        settled = true;

        if (errorParam || !code) {
          rejectPromise(new Error(errorParam ?? 'No authorization code received'));
          return;
        }

        finishExchange(code, redirectUri).then(resolvePromise, rejectPromise);
      });

      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        server.close();
        rejectPromise(new Error('Google sign-in timed out'));
      }, CONNECT_TIMEOUT_MS);

      let redirectUri = '';
      let pendingClient: OAuth2Client | null = null;
      server.listen(0, '127.0.0.1', () => {
        const { port } = server.address() as AddressInfo;
        redirectUri = `http://127.0.0.1:${port}/oauth2callback`;
        pendingClient = createClient(redirectUri);
        const authUrl = pendingClient.generateAuthUrl({
          access_type: 'offline',
          prompt: 'consent',
          scope: SCOPES,
        });
        shell.openExternal(authUrl);
      });

      async function finishExchange(code: string, usedRedirectUri: string): Promise<AuthStatus> {
        const activeClient = pendingClient ?? createClient(usedRedirectUri);
        const { tokens } = await activeClient.getToken({ code, redirect_uri: usedRedirectUri });
        activeClient.setCredentials(tokens);
        client = activeClient;

        if (tokens.refresh_token) {
          await saveRefreshToken(tokens.refresh_token);
        }

        const email = await fetchEmail(activeClient);
        const store = await getStore();
        store.set('auth.email', email);
        store.set('auth.connectedAt', new Date().toISOString());

        return {
          state: 'connected',
          email,
          rootFolderId: store.get('auth.rootFolderId'),
          rootFolderPath: store.get('auth.rootFolderPath'),
        };
      }
    });

    currentState = result;
    return currentState;
  } catch (error) {
    currentState = {
      state: 'error',
      email: null,
      rootFolderId: null,
      rootFolderPath: null,
      error: error instanceof Error ? error.message : 'Failed to connect to Google',
    };
    return currentState;
  }
}

export async function disconnect(): Promise<void> {
  try {
    await client?.revokeCredentials();
  } catch {
    // best-effort; ignore revoke failures (e.g. already revoked)
  }
  client = null;
  await clearRefreshToken();
  const store = await getStore();
  store.set('auth.email', null);
  store.set('auth.rootFolderId', null);
  store.set('auth.rootFolderPath', null);
  store.set('auth.connectedAt', null);
  currentState = { state: 'disconnected', email: null, rootFolderId: null, rootFolderPath: null };
}

export async function setRootFolder(folder: { id: string; path: string }): Promise<AuthStatus> {
  const store = await getStore();
  store.set('auth.rootFolderId', folder.id);
  store.set('auth.rootFolderPath', folder.path);
  currentState = { ...currentState, rootFolderId: folder.id, rootFolderPath: folder.path };
  return currentState;
}
