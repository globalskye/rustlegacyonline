import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { setApiAuthGetter } from '../services/api';
import i18n from '../i18n/config';

export interface UserInfo {
  login: string;
  balance: number;
  steamId?: string;
}

interface AppContextType {
  isAdmin: boolean;
  user: UserInfo | null;
  authLoading: boolean;
  login: (loginOrUser: string, pass: string) => Promise<boolean>;
  register: (login: string, pass: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  getAuthHeader: () => Record<string, string> | null;
  refreshUser: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const AUTH_KEY = 'rustlegacy-auth';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authToken, setAuthToken] = useState<string | null>(() =>
    localStorage.getItem(AUTH_KEY)
  );
  const [user, setUser] = useState<UserInfo | null>(null);
  const [role, setRole] = useState<string>('');
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#1a1a2e');
  }, []);

  const fetchMe = useCallback(async () => {
    if (!authToken) {
      setUser(null);
      setRole('');
      setAuthLoading(false);
      return;
    }
    const api = process.env.REACT_APP_API_URL || '/api';
    try {
      const res = await fetch(`${api}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) {
        setAuthToken(null);
        localStorage.removeItem(AUTH_KEY);
        setUser(null);
        setRole('');
        return;
      }
      const data = await res.json();
      setRole(data.role || '');
      if (data.role === 'user' && data.login) {
        setUser({
          login: data.login,
          balance: data.balance ?? 0,
          steamId: data.steamId,
        });
      } else {
        setUser(null);
      }
    } catch {
      setAuthToken(null);
      localStorage.removeItem(AUTH_KEY);
      setUser(null);
      setRole('');
    } finally {
      setAuthLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (loginOrUser: string, password: string): Promise<boolean> => {
    const api = process.env.REACT_APP_API_URL || '/api';
    const res = await fetch(`${api}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: loginOrUser, username: loginOrUser, password }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.token) {
      setAuthToken(data.token);
      localStorage.setItem(AUTH_KEY, data.token);
      setRole(data.role || '');
      if (data.role === 'user') {
        await fetchMe();
      } else {
        setUser(null);
        setAuthLoading(false);
      }
      return true;
    }
    return false;
  };

  const register = async (login: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    const api = process.env.REACT_APP_API_URL || '/api';
    const res = await fetch(`${api}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error || 'Registration failed' };
    }
    if (data.token) {
      setAuthToken(data.token);
      localStorage.setItem(AUTH_KEY, data.token);
      setRole('user');
      await fetchMe();
      return { ok: true };
    }
    return { ok: false, error: data.error };
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setRole('');
    localStorage.removeItem(AUTH_KEY);
  };

  const getAuthHeader = (): Record<string, string> | null => {
    if (!authToken) return null;
    return { Authorization: `Bearer ${authToken}` };
  };

  useEffect(() => {
    setApiAuthGetter(getAuthHeader);
    return () => setApiAuthGetter(null);
  }, [authToken]);

  return (
    <AppContext.Provider value={{
      isAdmin: role === 'admin',
      user,
      authLoading,
      login,
      register,
      logout,
      getAuthHeader,
      refreshUser: fetchMe,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const c = useContext(AppContext);
  if (!c) throw new Error('useApp must be inside AppProvider');
  return c;
}

// Auto-detect language only on first visit (when nothing saved in localStorage)
export function useLanguageDetect() {
  useEffect(() => {
    const stored = localStorage.getItem('rustlegacy-lang');
    if (stored) return; // User already has preference
    const lang = navigator.language?.toLowerCase() || '';
    const target = lang.startsWith('ru') ? 'ru' : 'en';
    if (i18n.language !== target) {
      i18n.changeLanguage(target);
    }
  }, []);
}
