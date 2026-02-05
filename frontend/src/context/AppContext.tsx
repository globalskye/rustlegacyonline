import React, { createContext, useContext, useEffect, useState } from 'react';
import { setApiAuthGetter } from '../services/api';
import i18n from '../i18n/config';

interface AppContextType {
  isAdmin: boolean;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
  getAuthHeader: () => Record<string, string> | null;
}

const AppContext = createContext<AppContextType | null>(null);

const AUTH_KEY = 'rustlegacy-auth';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authToken, setAuthToken] = useState<string | null>(() => 
    localStorage.getItem(AUTH_KEY)
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#1a1a2e');
  }, []);

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
