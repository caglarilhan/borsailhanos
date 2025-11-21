'use client';

import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';

type AuthenticatedLayoutProps = {
  children: React.ReactNode;
};

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const queryClient = useQueryClient();

  return (
    <AppShell
      title="BIST AI Workspace"
      description="AI destekli analiz modülleri"
      onRefresh={() => queryClient.invalidateQueries()}
    >
      {children}
    </AppShell>
  );
}

