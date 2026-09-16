import { toast } from '@renderer/components/ui/toast';
import { api } from '@renderer/lib/api';
import type { AuthStatus } from '@shared/types';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';

const DISCONNECTED: AuthStatus = {
  state: 'disconnected',
  email: null,
  rootFolderId: null,
  rootFolderPath: null,
};

interface AuthContextValue {
  status: AuthStatus;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  setRootFolder: (folder: { id: string; path: string }) => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [status, setStatus] = useState<AuthStatus>(DISCONNECTED);

  const refresh = useCallback(async () => {
    const next = await api.auth.getStatus();
    setStatus(next);
    if (next.state === 'error' && next.error) {
      toast.add({ title: 'Google Drive connection error', description: next.error, type: 'error' });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const connect = useCallback(async () => {
    setStatus((prev) => ({ ...prev, state: 'connecting' }));
    const next = await api.auth.connect();
    setStatus(next);
    if (next.state === 'error' && next.error) {
      toast.add({ title: 'Failed to connect to Google Drive', description: next.error, type: 'error' });
    } else if (next.state === 'connected') {
      toast.add({ title: `Connected as ${next.email}`, type: 'success' });
    }
  }, []);

  const disconnect = useCallback(async () => {
    await api.auth.disconnect();
    setStatus(DISCONNECTED);
  }, []);

  const setRootFolder = useCallback(async (folder: { id: string; path: string }) => {
    const next = await api.auth.setRootFolder(folder);
    setStatus(next);
  }, []);

  return <AuthContext.Provider value={{ status, connect, disconnect, setRootFolder, refresh }}>{children}</AuthContext.Provider>;
}

export function useAuthStatus(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthStatus must be used within an AuthProvider');
  return ctx;
}
