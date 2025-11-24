'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface Props {
  onTab: (tab: string | null) => void;
}

export default function SearchParamWrapper({ onTab }: Props) {
  const searchParams = useSearchParams();

  useEffect(() => {
    onTab(searchParams.get('tab'));
  }, [searchParams, onTab]);

  return null;
}
