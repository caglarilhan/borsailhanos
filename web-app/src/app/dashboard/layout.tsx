'use client';

import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    console.log('🚀 [HYDRATION] DashboardLayout CLIENT COMPONENT MOUNTED');
    console.log('✅ [AUTH] Auth check handled by middleware (HttpOnly cookies cannot be read from JS)');
  }, []);

  return <>{children}</>;
}

