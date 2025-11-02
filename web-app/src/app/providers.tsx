'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  // ErrorBoundary SSR'de sorun yaratıyor, runtime'da aktif olacak
  // Production'da client-side'da ErrorBoundary eklenebilir
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        {children}
        <ReactQueryDevtools initialOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
