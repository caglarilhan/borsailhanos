'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type AuthRole = 'admin' | 'trader' | 'guest';

interface AuthState {
  role: AuthRole;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  refreshAuth: () => void;
  logout: () => Promise<void>;
}

const defaultState: AuthState = { role: 'trader', isAuthenticated: false };

const AuthContext = createContext<AuthContextValue>({
  ...defaultState,
  refreshAuth: () => {},
  logout: async () => {},
});

function parseCookies(): Record<string, string> {
  if (typeof document === 'undefined') {
    return {};
  }
  return document.cookie.split(';').reduce<Record<string, string>>((acc, entry) => {
    const [rawKey, ...rest] = entry.trim().split('=');
    if (!rawKey) return acc;
    acc[decodeURIComponent(rawKey)] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

function resolveRole(rawRole?: string | null): AuthRole {
  if (!rawRole) return 'trader';
  const normalized = rawRole.toLowerCase();
  if (normalized === 'admin') return 'admin';
  if (normalized === 'guest') return 'guest';
  return 'trader';
}

function readAuthFromCookies(): AuthState {
  const cookies = parseCookies();
  // Check for JWT token first (HttpOnly, so we only check existence)
  const authToken = cookies.auth_token;
  // Fallback to legacy session_id for backward compatibility
  const sessionId = cookies.session_id;
  const role = resolveRole(cookies.user_role);
  
  // Authenticated if either JWT token or session_id exists
  const isAuthenticated = Boolean(authToken || sessionId);
  
  return {
    role,
    isAuthenticated,
  };
}

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(defaultState);

  const refreshAuth = useCallback(() => {
    const nextState = readAuthFromCookies();
    setAuthState((prev) =>
      prev.role === nextState.role && prev.isAuthenticated === nextState.isAuthenticated
        ? prev
        : nextState,
    );
  }, []);

  useEffect(() => {
    refreshAuth();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshAuth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    const intervalId = setInterval(refreshAuth, 60_000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(intervalId);
    };
  }, [refreshAuth]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      refreshAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, [refreshAuth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...authState,
      refreshAuth,
      logout,
    }),
    [authState, refreshAuth, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
