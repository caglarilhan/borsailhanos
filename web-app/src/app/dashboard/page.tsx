'use client';

import { useEffect } from 'react';
import DashboardV33Shell from '@/components/DashboardV33Shell';

export default function DashboardPage() {
  useEffect(() => {
    console.log('🚀 [HYDRATION] DashboardPage CLIENT COMPONENT MOUNTED');
    console.log('🚀 [HYDRATION] Dashboard page is now fully client-side');
  }, []);

  return <DashboardV33Shell />;
}
