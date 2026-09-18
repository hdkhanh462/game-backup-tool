import axios from 'axios';
import { shell } from 'electron';
import { OAuth2Client } from 'google-auth-library';
import http from 'http';
import type { AddressInfo } from 'net';

import type { AuthStatus } from '../shared/types';
import { clearRefreshToken, loadRefreshToken, saveRefreshToken } from './secureToken';
import { get as getSettings } from './settings';
import { getStore } from './store';

const SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'];
const CONNECT_TIMEOUT_MS = 2 * 60 * 1000;

let client: OAuth2Client | null = null;
let currentState: AuthStatus = {
  state: 'disconnected',
  email: null,
  name: null,
  picture: null,
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

interface GoogleProfile {
  email: string | null;
  name: string | null;
  picture: string | null;
}

async function fetchProfile(activeClient: OAuth2Client): Promise<GoogleProfile> {
  try {
    const { token } = await activeClient.getAccessToken();
    if (!token) return { email: null, name: null, picture: null };
    const { data } = await axios.get<{ email?: string; name?: string; picture?: string }>('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { email: data.email ?? null, name: data.name ?? null, picture: data.picture ?? null };
  } catch {
    return { email: null, name: null, picture: null };
  }
}

function isInvalidGrantError(error: unknown): boolean {
  const data = (error as { response?: { data?: { error?: string } } })?.response?.data;
  return data?.error === 'invalid_grant';
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
      name: null,
      picture: null,
      rootFolderId: null,
      rootFolderPath: null,
      error: 'Missing OAuth client credentials',
    };
    return currentState;
  }

  const refreshToken = await loadRefreshToken();
  if (!refreshToken) {
    currentState = { state: 'disconnected', email: null, name: null, picture: null, rootFolderId: null, rootFolderPath: null };
    return currentState;
  }

  try {
    const activeClient = createClient();
    activeClient.setCredentials({ refresh_token: refreshToken });
    await activeClient.getAccessToken();
    client = activeClient;

    const store = await getStore();
    const profile = await fetchProfile(activeClient);
    const email = profile.email ?? store.get('auth.email');
    const name = profile.name ?? store.get('auth.name');
    const picture = profile.picture ?? store.get('auth.picture');
    currentState = {
      state: 'connected',
      email,
      name,
      picture,
      rootFolderId: store.get('auth.rootFolderId'),
      rootFolderPath: store.get('auth.rootFolderPath'),
    };
  } catch (error) {
    if (isInvalidGrantError(error)) {
      // The refresh token itself is no longer valid (revoked, expired) — a real sign-out.
      await clearRefreshToken();
      currentState = { state: 'disconnected', email: null, name: null, picture: null, rootFolderId: null, rootFolderPath: null };
    } else {
      // A transient failure (network, DNS, Google outage) — keep the refresh token so the
      // next launch can recover automatically instead of forcing the user to reconnect.
      currentState = {
        state: 'error',
        email: null,
        name: null,
        picture: null,
        rootFolderId: null,
        rootFolderPath: null,
        error: 'Could not reach Google — check your connection and try again',
      };
    }
  }

  return currentState;
}

const CALLBACK_PAGE_TEXT = {
  en: {
    success: { title: 'Signed in successfully', description: 'You can close this window and return to the app.' },
    error: { title: 'Sign-in failed', description: 'You can close this window and return to the app to try again.' },
  },
  vi: {
    success: { title: 'Đăng nhập thành công', description: 'Bạn có thể đóng cửa sổ này và quay lại ứng dụng.' },
    error: { title: 'Đăng nhập thất bại', description: 'Bạn có thể đóng cửa sổ này và quay lại ứng dụng để thử lại.' },
  },
} satisfies Record<string, { success: { title: string; description: string }; error: { title: string; description: string } }>;

function renderCallbackPage(options: { success: boolean; language: string | null }): string {
  const { success } = options;
  const text = CALLBACK_PAGE_TEXT[options.language === 'vi' ? 'vi' : 'en'][success ? 'success' : 'error'];
  const { title, description } = text;
  const icon = success
    ? '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
    : '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="color-scheme" content="light dark" />
<title>${title}</title>
<style>
  :root {
    --background: oklch(1 0 0);
    --foreground: oklch(0.145 0 0);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.145 0 0);
    --primary: oklch(0.457 0.24 277.023);
    --primary-foreground: oklch(0.962 0.018 272.314);
    --destructive: oklch(0.577 0.245 27.325);
    --destructive-foreground: oklch(0.985 0 0);
    --muted-foreground: oklch(0.556 0 0);
    --border: oklch(0.922 0 0);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --background: oklch(0.145 0 0);
      --foreground: oklch(0.985 0 0);
      --card: oklch(0.205 0 0);
      --card-foreground: oklch(0.985 0 0);
      --primary: oklch(0.398 0.195 277.366);
      --primary-foreground: oklch(0.962 0.018 272.314);
      --destructive: oklch(0.704 0.191 22.216);
      --destructive-foreground: oklch(0.985 0 0);
      --muted-foreground: oklch(0.708 0 0);
      --border: oklch(1 0 0 / 10%);
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--background);
    color: var(--foreground);
    font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
    padding: 2.5rem 2rem;
    width: min(26rem, calc(100vw - 2rem));
    background: var(--card);
    color: var(--card-foreground);
    border: 1px solid var(--border);
    border-radius: 0.875rem;
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.08), 0 8px 24px rgb(0 0 0 / 0.06);
  }
  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 3rem;
    height: 3rem;
    border-radius: 9999px;
    background: ${success ? 'var(--primary)' : 'var(--destructive)'};
    color: ${success ? 'var(--primary-foreground)' : 'var(--destructive-foreground)'};
  }
  h1 { font-size: 1.05rem; font-weight: 600; margin: 0; text-wrap: balance; }
  p { font-size: 0.875rem; color: var(--muted-foreground); margin: 0; line-height: 1.5; text-wrap: balance; }
</style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${description}</p>
  </div>
</body>
</html>`;
}

export async function connect(): Promise<AuthStatus> {
  currentState = { ...currentState, state: 'connecting' };
  const { language } = await getSettings();

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
        res.end(renderCallbackPage({ success: !(errorParam || !code), language }));

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

        const profile = await fetchProfile(activeClient);
        const store = await getStore();
        store.set('auth.email', profile.email);
        store.set('auth.name', profile.name);
        store.set('auth.picture', profile.picture);
        store.set('auth.connectedAt', new Date().toISOString());

        return {
          state: 'connected',
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
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
      name: null,
      picture: null,
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
  store.set('auth.name', null);
  store.set('auth.picture', null);
  store.set('auth.rootFolderId', null);
  store.set('auth.rootFolderPath', null);
  store.set('auth.connectedAt', null);
  currentState = { state: 'disconnected', email: null, name: null, picture: null, rootFolderId: null, rootFolderPath: null };
}

export async function setRootFolder(folder: { id: string; path: string }): Promise<AuthStatus> {
  const store = await getStore();
  store.set('auth.rootFolderId', folder.id);
  store.set('auth.rootFolderPath', folder.path);
  currentState = { ...currentState, rootFolderId: folder.id, rootFolderPath: folder.path };
  return currentState;
}
