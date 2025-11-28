'use client';

import { Suspense, useCallback, useState, useEffect } from 'react';
import DashboardV33Inner, { DashboardTab, isDashboardTab } from '@/components/DashboardV33Inner';
import SearchParamWrapper from '@/components/SearchParamWrapper';
import UserBadge from '@/components/auth/UserBadge';

export default function DashboardV33Shell() {
  useEffect(() => {
    console.log('🚀 [HYDRATION] DashboardV33Shell CLIENT COMPONENT MOUNTED');
    console.log('🚀 [HYDRATION] React hydration successful - JS is working');
    console.log('🚀 [HYDRATION] typeof window:', typeof window);
    if (typeof window !== 'undefined') {
      console.log('🚀 [HYDRATION] Event listeners can be attached');
    }
  }, []);

  const [initialTab, setInitialTab] = useState<DashboardTab | undefined>(undefined);

  const handleTab = useCallback((tabValue: string | null) => {
    const normalized = isDashboardTab(tabValue) ? tabValue : undefined;
    setInitialTab((prev) => (prev === normalized ? prev : normalized));
  }, []);

  useEffect(() => {
    console.log('🌳 [COMPONENT TREE] DashboardV33Shell render complete');
    console.log('🌳 [COMPONENT TREE] UserBadge, SearchParamWrapper, DashboardV33Inner should mount');
  });

  return (
    <>
      <UserBadge />
      <Suspense fallback={null}>
        <SearchParamWrapper onTab={handleTab} />
      </Suspense>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-white text-slate-600">
            Dashboard yükleniyor...
          </div>
        }
      >
        <DashboardV33Inner initialTab={initialTab} />
      </Suspense>
    </>
  );
}
