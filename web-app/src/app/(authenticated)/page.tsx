'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import PlaceholderCard from '@/components/shared/PlaceholderCard';

const SignalBoard = dynamic(() =>
  import('@/components/signals/SignalBoard').then((mod) => mod.SignalBoard)
);
const RiskEnginePanel = dynamic(() =>
  import('@/components/risk/RiskEnginePanel').then((mod) => mod.RiskEnginePanel)
);
const RiskQuestionnaire = dynamic(() =>
  import('@/components/risk/RiskQuestionnaire').then((mod) => mod.RiskQuestionnaire)
);
const MarketCharts = dynamic(() =>
  import('@/components/charts/MarketCharts').then((mod) => mod.MarketCharts)
);
const SentimentPanel = dynamic(() =>
  import('@/components/sentiment/SentimentPanel').then((mod) => mod.SentimentPanel)
);
const MultiTimeframe = dynamic(() =>
  import('@/components/analysis/MultiTimeframe').then((mod) => mod.MultiTimeframe)
);

export default function DashboardPage() {
  return (
    <>
      <Suspense fallback={<PlaceholderCard title="Sinyaller yükleniyor..." badge={{ text: 'Loading', color: 'blue' }} />}>
        <SignalBoard />
      </Suspense>

      <Suspense fallback={<PlaceholderCard title="Risk & Portföy" badge={{ text: 'Loading', color: 'blue' }} />}>
        <RiskEnginePanel />
      </Suspense>

      <Suspense fallback={<PlaceholderCard title="Risk Testi" badge={{ text: 'Loading', color: 'blue' }} />}>
        <RiskQuestionnaire />
      </Suspense>

      <Suspense fallback={<PlaceholderCard title="Grafikler" badge={{ text: 'Loading', color: 'blue' }} />}>
        <MarketCharts />
      </Suspense>

      <Suspense fallback={<PlaceholderCard title="Sentiment & Haberler" badge={{ text: 'Loading', color: 'blue' }} />}>
        <SentimentPanel />
      </Suspense>

      <Suspense fallback={<PlaceholderCard title="Çoklu Zaman Analizi" badge={{ text: 'Loading', color: 'blue' }} />}>
        <MultiTimeframe />
      </Suspense>
    </>
  );
}

