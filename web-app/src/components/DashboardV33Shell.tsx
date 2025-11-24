'use client';

import { Suspense, useCallback, useState } from 'react';
import DashboardV33Inner, { DashboardTab, isDashboardTab } from '@/components/DashboardV33Inner';
import SearchParamWrapper from '@/components/SearchParamWrapper';

export default function DashboardV33Shell() {
  const [initialTab, setInitialTab] = useState<DashboardTab | undefined>(undefined);

  const handleTab = useCallback((tabValue: string | null) => {
    const normalized = isDashboardTab(tabValue) ? tabValue : undefined;
    setInitialTab((prev) => (prev === normalized ? prev : normalized));
  }, []);

  return (
    <>
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
