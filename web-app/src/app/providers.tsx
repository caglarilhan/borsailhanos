'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@/components/auth/AuthProvider';

// P2-1: API latency - Optimize TanStack Query cache (staleTime + gcTime)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds - data is fresh for 30s
      gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache for 5min (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch on reconnect
      retry: 1, // Retry once on failure
      retryDelay: 1000, // 1 second delay between retries
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  // ErrorBoundary SSR'de sorun yaratıyor, runtime'da aktif olacak
  // Production'da client-side'da ErrorBoundary eklenebilir
  // Dark mode kaldırıldı - sadece light theme
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
      <ReactQueryDevtools initialOpen={false} />
    </QueryClientProvider>
  );
}
