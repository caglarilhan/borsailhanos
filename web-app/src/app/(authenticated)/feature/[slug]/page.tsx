'use client';

import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import SignalBoardMini from '@/components/feature/SignalBoardMini';
import { SentimentPanel } from '@/components/sentiment/SentimentPanel';
import TrendModule from '@/components/feature/TrendModule';
import CorrelationHeatmap from '@/components/feature/CorrelationHeatmap';
import PortfolioMini from '@/components/feature/PortfolioMini';
import PlaceholderCard from '@/components/shared/PlaceholderCard';

const featureModules: Record<string, JSX.Element> = {
  signals: <SignalBoardMini />,
  sentiment: <SentimentPanel />,
  trend: <TrendModule />,
  correlation: <CorrelationHeatmap />,
  portfolio: <PortfolioMini />,
};

export default function FeaturePage({ params }: { params: { slug: string } }) {
  const slug = params.slug?.toLowerCase();
  const featureModule = featureModules[slug];

  if (!featureModule) {
    return notFound();
  }

  return (
    <div className="col-span-12 space-y-4">
      <Suspense
        fallback={
          <PlaceholderCard
            title="Modül yükleniyor"
            description="AI modül verileri getiriliyor..."
            badge={{ text: 'Loading', color: 'blue' }}
          />
        }
      >
        {featureModule}
      </Suspense>
    </div>
  );
}
