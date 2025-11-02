'use client';

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import dynamic from 'next/dynamic';

const ErrorBoundary = dynamic(() => import('@/components/ErrorBoundary'), { ssr: false });

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const content = (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        {children}
        <ReactQueryDevtools initialOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );

  // ErrorBoundary sadece client-side'da aktif
  if (!mounted) {
    return content;
  }

  return <ErrorBoundary>{content}</ErrorBoundary>;
}
