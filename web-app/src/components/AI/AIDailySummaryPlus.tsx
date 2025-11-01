'use client';

import React, { useEffect, useState, useMemo } from 'react';
// Inline Sparkline component (SSR-safe)
const Sparkline = React.memo(({ series, width = 800, height = 64, color = '#2563eb' }: { series: number[]; width?: number; height?: number; color?: string }) => {
  if (!series || series.length === 0) return null;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const scaleX = (i: number) => (i / (series.length - 1)) * width;
  const scaleY = (v: number) => height - ((v - min) / Math.max(1, max - min)) * height;
  let d = '';
  series.forEach((v, i) => {
    const x = scaleX(i);
    const y = scaleY(v);
    d += (i === 0 ? 'M' : 'L') + x + ' ' + y + ' ';
  });
  return (
    <svg width={width} height={height} viewBox={'0 0 ' + width + ' ' + height} className="flex-shrink-0" style={{ maxWidth: width, maxHeight: height }}>
      <path d={d} fill="none" stroke={color} strokeWidth={2} />
    </svg>
  );
}, (prevProps, nextProps) => prevProps.series.length === nextProps.series.length);
Sparkline.displayName = 'Sparkline';

interface AIDailySummaryPlusProps {
  metaStats?: {
    totalSignals?: number;
    highConfidenceBuys?: number;
    regime?: string;
    volatility?: number;
  };
  macroFeed?: {
    usdtry?: number;
    cds?: number;
    vix?: number;
    gold?: number;
  };
  sectoralMatch?: {
    sectors?: Array<{ name: string; correlation: number }>;
  };
  aiConfidenceHistory?: number[];
}

export function AIDailySummaryPlus({ 
  metaStats, 
  macroFeed, 
  sectoralMatch,
  aiConfidenceHistory = []
}: AIDailySummaryPlusProps) {
  const [tickerText, setTickerText] = useState<string>('');
  
  // Generate AI daily summary text
  const aiSummary = useMemo(() => {
    const totalSignals = metaStats?.totalSignals || 120;
    const highConfBuys = metaStats?.highConfidenceBuys || 18;
    const regime = metaStats?.regime || 'risk-on';
    const volatility = metaStats?.volatility || 0.85;
    
    const usdtry = macroFeed?.usdtry || 32.5;
    const usdtryChange = usdtry > 32.0 ? 'değer kaybı' : 'değer kazancı';
    const usdtryPct = Math.abs(((usdtry - 32.0) / 32.0) * 100).toFixed(1);
    
    return {
      macro: `Bugün endeks açılışında TRY ${usdtryChange} %${usdtryPct}, en güçlü sektör teknoloji.`,
      aiSamples: `AI bugün ${totalSignals} sinyal taradı, ${highConfBuys} yüksek güvenli (>%85) BUY önerisi var.`,
      metaComment: `Meta ensemble modelleri '${regime}' rejimine geçti, volatilite ${volatility < 1 ? 'azaldı' : 'arttı'}.`,
      sectoral: sectoralMatch?.sectors?.length 
        ? `${sectoralMatch.sectors[0]?.name || 'Bankacılık'} ve ${sectoralMatch.sectors[1]?.name || 'Enerji'} sektörlerinde korelasyon %${(sectoralMatch.sectors[0]?.correlation || 0.72) * 100} — hedge fırsatı.`
        : 'Sektörel analiz hazırlanıyor...'
    };
  }, [metaStats, macroFeed, sectoralMatch]);

  // Ticker bar animation
  useEffect(() => {
    const fullText = [
      aiSummary.macro,
      aiSummary.aiSamples,
      aiSummary.metaComment,
      aiSummary.sectoral
    ].join(' • ');
    setTickerText(fullText);
  }, [aiSummary]);

  // Generate AI confidence history if not provided
  const confidenceSeries = useMemo(() => {
    if (aiConfidenceHistory.length > 0) return aiConfidenceHistory;
    // Generate mock 24h confidence history (SSR-safe seeded)
    const seed = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // Daily seed
    let r = seed;
    const seededRandom = () => {
      r = (r * 1103515245 + 12345) >>> 0;
      return (r / 0xFFFFFFFF);
    };
    return Array.from({ length: 24 }, (_, i) => {
      const base = 0.75;
      const trend = (i / 24) * 0.05;
      const noise = (seededRandom() - 0.5) * 0.1;
      return Math.max(0.65, Math.min(0.95, base + trend + noise));
    });
  }, [aiConfidenceHistory]);

  return (
    <div className="w-full rounded-xl border bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 shadow-md mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-slate-900">🤖 AI Günlük Özeti+</span>
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            v5.0 Pro Decision Flow
          </span>
        </div>
        <div className="text-xs text-slate-600">
          {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} (UTC+3)
        </div>
      </div>

      {/* Ticker Bar (Horizontal scrolling text) */}
      <div className="mb-3 overflow-hidden bg-white/60 backdrop-blur rounded-lg p-2 border border-slate-200">
        <div className="whitespace-nowrap animate-scroll text-xs text-slate-800 font-medium">
          {tickerText}
        </div>
      </div>

      {/* AI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Makro Analiz */}
        <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-slate-200">
          <div className="text-xs font-semibold text-slate-700 mb-1">📊 Makro Analiz</div>
          <div className="text-sm text-slate-900">{aiSummary.macro}</div>
        </div>

        {/* AI Tahmin Sampları */}
        <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-slate-200">
          <div className="text-xs font-semibold text-slate-700 mb-1">🎯 AI Tahmin Sampları</div>
          <div className="text-sm text-slate-900">{aiSummary.aiSamples}</div>
        </div>

        {/* Meta-Model Yorumu */}
        <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-slate-200">
          <div className="text-xs font-semibold text-slate-700 mb-1">🧠 Meta-Model Yorumu</div>
          <div className="text-sm text-slate-900">{aiSummary.metaComment}</div>
        </div>

        {/* Sektörel Eşleşme */}
        <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-slate-200">
          <div className="text-xs font-semibold text-slate-700 mb-1">🔗 Sektörel Eşleşme</div>
          <div className="text-sm text-slate-900">{aiSummary.sectoral}</div>
        </div>
      </div>

      {/* Makro Göstergeler Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white/80 backdrop-blur rounded-lg p-2 border border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-600">USD/TRY</span>
          <span className="text-sm font-bold text-slate-900">{macroFeed?.usdtry?.toFixed(2) || '32.50'}</span>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-lg p-2 border border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-600">CDS 5Y</span>
          <span className="text-sm font-bold text-slate-900">{macroFeed?.cds?.toFixed(0) || '420'}</span>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-lg p-2 border border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-600">VIX</span>
          <span className="text-sm font-bold text-slate-900">{macroFeed?.vix?.toFixed(1) || '18.5'}</span>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-lg p-2 border border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-600">Altın (₺/gr)</span>
          <span className="text-sm font-bold text-slate-900">{macroFeed?.gold?.toFixed(2) || '2,850.00'}</span>
        </div>
      </div>

      {/* AI Confidence Tracker (24h graph) */}
      <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-slate-700">📈 AI Confidence Tracker (24s)</div>
          <div className="text-xs text-slate-600">
            Ortalama: {Math.round(confidenceSeries.reduce((a, b) => a + b, 0) / confidenceSeries.length * 100)}%
          </div>
        </div>
        <div className="h-16 w-full">
          <Sparkline 
            series={confidenceSeries.map(v => v * 100)} 
            width={800} 
            height={64} 
            color="#2563eb"
          />
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          Son 24 saatte AI güven trendi: {confidenceSeries[confidenceSeries.length - 1] > confidenceSeries[0] ? '↑ Yükseliş' : '↓ Düşüş'}
        </div>
      </div>
    </div>
  );
}

// Ticker animation will be handled by CSS in globals.css

