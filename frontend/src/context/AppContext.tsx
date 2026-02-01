import React, { createContext, useContext, useEffect, useState } from 'react';
import { setApiAuthGetter } from '../services/api';
import i18n from '../i18n/config';

type Theme = 'light' | 'dark' | 'auto';

interface AppContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  isAdmin: boolean;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
  getAuthHeader: () => Record<string, string> | null;
}

const AppContext = createContext<AppContextType | null>(null);

const THEME_KEY = 'rustlegacy-theme';
const AUTH_KEY = 'rustlegacy-auth';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const s = localStorage.getItem(THEME_KEY);
    return (s as Theme) || 'auto';
  });
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [authToken, setAuthToken] = useState<string | null>(() => 
    localStorage.getItem(AUTH_KEY)
  );

  useEffect(() => {
    const applyTheme = (isDark: boolean) => {
      setResolvedTheme(isDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    };
    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mq.matches);
      mq.addEventListener('change', (e) => applyTheme(e.matches));
      return () => mq.removeEventListener('change', () => {});
    }
    applyTheme(theme === 'dark');
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    const api = process.env.REACT_APP_API_URL || '/api';
    const res = await fetch(`${api}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.token) {
      setAuthToken(data.token);
      localStorage.setItem(AUTH_KEY, data.token);
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuthToken(null);
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
      theme,
      setTheme,
      resolvedTheme,
      isAdmin: !!authToken,
      login,
      logout,
      getAuthHeader,
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
