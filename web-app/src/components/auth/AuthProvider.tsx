'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';

interface AuthContextValue {
  role: 'admin' | 'trader';
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({ role: 'trader', isAuthenticated: false });

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextBridge>{children}</AuthContextBridge>
    </SessionProvider>
  );
}

function AuthContextBridge({ children }: { children: React.ReactNode }) {
  const { data, status } = useSession();
  const value = useMemo<AuthContextValue>(() => {
    const role = (data?.user?.role === 'admin' ? 'admin' : 'trader') as 'admin' | 'trader';
    return {
      role,
      isAuthenticated: status === 'authenticated',
    };
  }, [data?.user?.role, status]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


