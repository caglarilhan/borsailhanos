'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextValue {
  role: 'admin' | 'trader';
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({ role: 'trader', isAuthenticated: false });

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<AuthContextValue>({ role: 'trader', isAuthenticated: false });

  // Auto-refresh session every 10 minutes
  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      try {
        const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (!mounted) return;
          setValue({ role: (data?.user?.role || 'trader') as any, isAuthenticated: true });
        } else if (res.status === 401) {
          // 401 = no valid session = not authenticated
          // Guest login may create a session for middleware, but user is still not authenticated
          if (!mounted) return;
          setValue({ role: 'trader', isAuthenticated: false });
        }
      } catch {
        // Silent fail - don't spam logs
      }
    };
    // initial & interval
    refresh();
    const id = setInterval(refresh, 10 * 60 * 1000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}


