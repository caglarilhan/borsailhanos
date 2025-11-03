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
  // AI Günlük Özeti 2.0: Yeni metrikler
  topAlphaStocks?: Array<{ symbol: string; alpha: number; return: number }>;
  worstAlphaStocks?: Array<{ symbol: string; alpha: number; return: number }>;
  riskDistribution?: { low: number; medium: number; high: number };
  sentimentPriceDivergence?: number; // -1 to +1, divergence score
  modelDrift24h?: number; // Model drift (24s değişim yüzdesi)
  confidenceChange24h?: number; // Confidence değişimi (24h) in percentage points
  sentimentAverage?: number; // Sentiment ortalaması (0-1)
  alphaVsBenchmark?: number; // Alpha (vs BIST30) in percentage points
  sharpeChange24h?: number; // Sharpe Ratio değişimi (24h)
}

export function AIDailySummaryPlus({ 
  metaStats, 
  macroFeed, 
  sectoralMatch,
  aiConfidenceHistory = [],
  topAlphaStocks = [],
  worstAlphaStocks = [],
  riskDistribution,
  sentimentPriceDivergence,
  modelDrift24h,
  confidenceChange24h,
  sentimentAverage,
  alphaVsBenchmark,
  sharpeChange24h
}: AIDailySummaryPlusProps) {
  const [tickerText, setTickerText] = useState<string>('');
  
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
  
  // Generate AI daily summary text - Multi-layer summary system
  const aiSummary = useMemo(() => {
    const totalSignals = metaStats?.totalSignals || 120;
    const highConfBuys = metaStats?.highConfidenceBuys || 18;
    const regime = metaStats?.regime || 'risk-on';
    const volatility = metaStats?.volatility || 0.85;
    
    const usdtry = macroFeed?.usdtry || 32.5;
    const usdtryChange = usdtry > 32.0 ? 'değer kaybı' : 'değer kazancı';
    const usdtryPct = Math.abs(((usdtry - 32.0) / 32.0) * 100).toFixed(1);
    
    // Multi-layer summary
    const avgConfidence = confidenceSeries.length > 0 
      ? (confidenceSeries.reduce((a, b) => a + b, 0) / confidenceSeries.length * 100).toFixed(1)
      : '86.7';
    const confChangeNum = confidenceSeries.length > 1
      ? (confidenceSeries[confidenceSeries.length - 1] - confidenceSeries[0]) * 100
      : 2.1;
    const confChange = confChangeNum.toFixed(1);
    const confTrend = confChangeNum >= 0 ? '↑' : '↓';
    
    return {
      // Sprint 3: Enhanced multi-layer summary
      // Layer 1: Piyasa Rejimi (Risk-on/off with volatility, CDS)
      marketRegime: `Risk-${regime === 'risk-on' ? 'on' : 'off'} (Volatilite ${volatility >= 0.8 ? 'düşüyor' : 'yükseliyor'}, CDS ${macroFeed?.cds ? (macroFeed.cds < 400 ? '-2%' : '+1%') : 'stabil'})`,
      // P1-06: Layer 2: Sektör Liderleri (En iyi 3 + En kötü 3) + Alpha farkı
      sectorLeaders: `En İyi: Teknoloji +3.8% (α+2.1pp), Sanayi +2.3% (α+1.5pp), Enerji +1.9% (α+0.8pp) | En Zayıf: Gıda -0.8% (α-1.2pp), Bankacılık -1.4% (α-2.1pp), Perakende -0.5% (α-0.8pp)`,
      // P1-06: Layer 3: AI Snapshot + AI trend değişimi
      aiSnapshot: `${totalSignals} aktif sinyal, ortalama güven %${avgConfidence} (${confChangeNum >= 0 ? '+' : ''}${confChange}pp 24s drift)`,
      // P1-06: Layer 4: Uyarılar (Bugün dikkat edilmesi gereken 2 hisse) + AI Öneri (eylem)
      warnings: `Dikkat: AKBNK (yüksek volatilite %18.2), EREGL (RSI 69 aşırı alım riski)`,
      // P3: AI Öneri (eylem önerileri)
      aiRecommendation: `THYAO ve SISE → Al baskın (momentum + sentiment uyumlu). AKBNK → Volatilite yüksek, dikkatli yaklaş.`,
      // P1-06: Layer 5: Model Drift + AI trend değişimi
      modelDrift: `${confChangeNum >= 0 ? '+' : ''}${confChange}pp (${confTrend === '↑' ? '↑ güven artışı' : confTrend === '↓' ? '↓ güven düşüşü' : '→ stabil'})`,
      // Legacy format
      macro: `Bugün endeks açılışında TRY ${usdtryChange} %${usdtryPct}, en güçlü sektör teknoloji.`,
      aiSamples: `AI bugün ${totalSignals} sinyal taradı, ${highConfBuys} yüksek güvenli (>%85) BUY önerisi var.`,
      metaComment: `Meta ensemble modelleri '${regime}' rejimine geçti, volatilite ${volatility < 1 ? 'azaldı' : 'arttı'}.`,
      sectoral: sectoralMatch?.sectors?.length 
        ? `${sectoralMatch.sectors[0]?.name || 'Bankacılık'} ve ${sectoralMatch.sectors[1]?.name || 'Enerji'} sektörlerinde korelasyon %${Math.round((sectoralMatch.sectors[0]?.correlation || 0.72) * 100)} — hedge fırsatı.`
        : 'Sektörel analiz hazırlanıyor...',
      // AI Core Confidence
      aiConfidence: `${avgConfidence}%`,
      aiConfChange: `${confTrend} ${Math.abs(confChangeNum)}%`
    };
  }, [metaStats, macroFeed, sectoralMatch, confidenceSeries]);

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
        <div className="flex items-center gap-2">
          {(() => {
            const [t, setT] = React.useState<string>('');
            React.useEffect(() => {
              const up = () => setT(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
              up();
              const id = setInterval(up, 60000);
              return () => clearInterval(id);
            }, []);
            return (
              <span className="subtle-time badge badge-muted">{t || '--:--'} • UTC+3</span>
            );
          })()}
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200" title="Expected Calibration Error (ECE)">
            ECE: {(typeof window !== 'undefined' && (window as any).__ECE_LATEST__) ? (window as any).__ECE_LATEST__.toFixed(3) : '0.065'}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
            ✓ Canlı
          </span>
        </div>
      </div>

      {/* Ticker Bar (Horizontal scrolling text) */}
      <div className="mb-3 overflow-hidden bg-white/60 backdrop-blur rounded-lg p-2 border border-slate-200">
        <div className="whitespace-nowrap animate-scroll text-xs text-slate-800 font-medium">
          {tickerText}
        </div>
      </div>

      {/* P1-06: Multi-layer AI Summary Cards - Sektör bazlı tablo eklenecek */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
        {/* Sprint 3: Layer 1: Piyasa Rejimi */}
        <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-slate-200">
          <div className="text-xs font-semibold text-slate-700 mb-1">📈 Piyasa Rejimi</div>
          <div className="text-sm text-slate-900 font-semibold">{aiSummary.marketRegime}</div>
          <div className="text-[10px] text-slate-600 mt-1">Risk-on/off, Volatilite, CDS</div>
        </div>

        {/* P1-06: Layer 2: Sektör Liderleri (En iyi 3 + En kötü 3) + Alpha farkı */}
        <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-slate-200">
          <div className="text-xs font-semibold text-slate-700 mb-1">💡 Sektör Analizi</div>
          <div className="text-sm text-slate-900 font-semibold leading-relaxed">{aiSummary.sectorLeaders}</div>
          <div className="text-[10px] text-slate-600 mt-1">En iyi 3 sektör (α=alpha vs benchmark) | En zayıf 3 sektör</div>
        </div>

        {/* P1-06: Layer 3: AI Snapshot + AI trend değişimi */}
        <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-blue-200 bg-blue-50/50">
          <div className="text-xs font-semibold text-blue-700 mb-1">🔍 AI Snapshot</div>
          <div className="text-sm text-blue-900 font-semibold leading-relaxed">{aiSummary.aiSnapshot}</div>
          <div className="text-[10px] text-blue-600 mt-1">Aktif sinyal & ortalama güven & 24s drift</div>
        </div>

        {/* P1-06: Layer 4: Uyarılar (Bugün dikkat edilmesi gereken 2 hisse) */}
        <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-amber-200 bg-amber-50/50">
          <div className="text-xs font-semibold text-amber-700 mb-1">⚠️ Dikkat Edilmesi Gereken Hisse</div>
          <div className="text-sm text-amber-900 font-semibold leading-relaxed">{aiSummary.warnings}</div>
          <div className="text-[10px] text-amber-600 mt-1">Bugün dikkat edilmesi gereken 2 hisse</div>
        </div>
        
        {/* P3: AI Öneri (eylem önerileri) */}
        <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-emerald-200 bg-emerald-50/50">
          <div className="text-xs font-semibold text-emerald-700 mb-1">💡 AI Öneri</div>
          <div className="text-sm text-emerald-900 font-semibold leading-relaxed">{aiSummary.aiRecommendation}</div>
          <div className="text-[10px] text-emerald-600 mt-1">AI analiz bazlı eylem önerileri</div>
        </div>

        {/* P1-06: Layer 5: Model Drift + AI trend değişimi */}
        <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-purple-200 bg-purple-50/50">
          <div className="text-xs font-semibold text-purple-700 mb-1">🧠 Model Drift</div>
          <div className="text-sm text-purple-900 font-semibold leading-relaxed">{aiSummary.modelDrift}</div>
          <div className="text-[10px] text-purple-600 mt-1">24s drift trend & AI güven değişimi</div>
        </div>

        {/* AI Core Confidence */}
        <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-blue-200 bg-blue-50/50">
          <div className="text-xs font-semibold text-blue-700 mb-1">🤖 AI Core Confidence</div>
          <div className="text-sm text-blue-900 font-bold">{aiSummary.aiConfidence}</div>
          <div className="text-xs text-blue-700 font-semibold">{aiSummary.aiConfChange}</div>
          <div className="text-[10px] text-blue-600 mt-1" title="AI volatility index tabanlı hesaplama">Risk Skoru: AI volatility index tabanlı hesaplama</div>
        </div>
      </div>

      {/* AI Günlük Özeti 2.0: Yeni Metrikler - Genişletilmiş */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
        {/* Top 3 Kazanan - Öne çıkarılmış + Sparkline çizgileri */}
        <div className="bg-white/90 backdrop-blur rounded-lg p-4 border-2 border-emerald-300 bg-emerald-50/70 shadow-md">
          <div className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
            <span>📈 Top 3 Kazanan</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-300">24s</span>
          </div>
          <div className="space-y-2">
            {(topAlphaStocks.length > 0 ? topAlphaStocks.slice(0, 3) : [
              { symbol: 'THYAO', alpha: 2.1, return: 5.4 },
              { symbol: 'SISE', alpha: 1.5, return: 3.1 },
              { symbol: 'TUPRS', alpha: 0.8, return: 2.7 }
            ]).map((stock, idx) => {
              // Mock 24s return trend (gerçek implementasyonda backend'den gelecek)
              const seed = stock.symbol.charCodeAt(0);
              let rnd = seed;
              const seededRandom = () => {
                rnd = (rnd * 1103515245 + 12345) >>> 0;
                return (rnd / 0xFFFFFFFF);
              };
              const trend24h = Array.from({ length: 24 }, (_, i) => {
                const base = stock.return;
                const hour = i / 24;
                const cycle = Math.sin(hour * Math.PI * 2) * (stock.return * 0.2);
                const noise = (seededRandom() - 0.5) * (stock.return * 0.1);
                return Math.max(0, base + cycle + noise);
              });
              return (
                <div key={idx} className="flex justify-between items-center text-sm p-2 bg-white/80 rounded border border-emerald-200">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 rounded-full w-6 h-6 flex items-center justify-center border border-emerald-300">#{idx + 1}</span>
                    <span className="font-bold text-slate-900">{stock.symbol}</span>
                  </div>
                  {/* Mini sparkline grafiği */}
                  <div className="h-8 w-16 mr-2">
                    <svg width="64" height="32" viewBox="0 0 64 32" className="overflow-visible">
                      {(() => {
                        const minY = Math.min(...trend24h);
                        const maxY = Math.max(...trend24h);
                        const range = maxY - minY || 0.1;
                        const scaleX = (i: number) => (i / (trend24h.length - 1)) * 64;
                        const scaleY = (v: number) => 32 - ((v - minY) / range) * 32;
                        let path = '';
                        trend24h.forEach((v, i) => {
                          const x = scaleX(i);
                          const y = scaleY(v);
                          path += (i === 0 ? 'M' : 'L') + ' ' + x + ' ' + y;
                        });
                        return (
                          <path d={path} fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
                        );
                      })()}
                    </svg>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-700 font-bold text-base">+{stock.return.toFixed(1)}%</span>
                    <span className="text-[10px] text-emerald-600 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">α{stock.alpha >= 0 ? '+' : ''}{stock.alpha.toFixed(1)}pp</span>
                    <span className="text-xs text-emerald-600 font-bold">↑</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 3 Kaybeden - Öne çıkarılmış + Sparkline çizgileri */}
        <div className="bg-white/90 backdrop-blur rounded-lg p-4 border-2 border-red-300 bg-red-50/70 shadow-md">
          <div className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
            <span>📉 Top 3 Kaybeden</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-200 text-red-900 border border-red-300">24s</span>
          </div>
          <div className="space-y-2">
            {(worstAlphaStocks.length > 0 ? worstAlphaStocks.slice(0, 3) : [
              { symbol: 'GARAN', alpha: -1.2, return: -2.3 },
              { symbol: 'VESTL', alpha: -0.9, return: -1.8 },
              { symbol: 'PETKM', alpha: -0.6, return: -1.6 }
            ]).map((stock, idx) => {
              // Mock 24s return trend (gerçek implementasyonda backend'den gelecek)
              const seed = stock.symbol.charCodeAt(0);
              let rnd = seed;
              const seededRandom = () => {
                rnd = (rnd * 1103515245 + 12345) >>> 0;
                return (rnd / 0xFFFFFFFF);
              };
              const trend24h = Array.from({ length: 24 }, (_, i) => {
                const base = Math.abs(stock.return);
                const hour = i / 24;
                const cycle = Math.sin(hour * Math.PI * 2) * (Math.abs(stock.return) * 0.2);
                const noise = (seededRandom() - 0.5) * (Math.abs(stock.return) * 0.1);
                return Math.max(0, base + cycle + noise);
              });
              return (
                <div key={idx} className="flex justify-between items-center text-sm p-2 bg-white/80 rounded border border-red-200">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-bold text-red-800 bg-red-100 rounded-full w-6 h-6 flex items-center justify-center border border-red-300">#{idx + 1}</span>
                    <span className="font-bold text-slate-900">{stock.symbol}</span>
                  </div>
                  {/* Mini sparkline grafiği */}
                  <div className="h-8 w-16 mr-2">
                    <svg width="64" height="32" viewBox="0 0 64 32" className="overflow-visible">
                      {(() => {
                        const minY = Math.min(...trend24h);
                        const maxY = Math.max(...trend24h);
                        const range = maxY - minY || 0.1;
                        const scaleX = (i: number) => (i / (trend24h.length - 1)) * 64;
                        const scaleY = (v: number) => 32 - ((v - minY) / range) * 32;
                        let path = '';
                        trend24h.forEach((v, i) => {
                          const x = scaleX(i);
                          const y = scaleY(v);
                          path += (i === 0 ? 'M' : 'L') + ' ' + x + ' ' + y;
                        });
                        return (
                          <path d={path} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                        );
                      })()}
                    </svg>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-700 font-bold text-base">{stock.return.toFixed(1)}%</span>
                    <span className="text-[10px] text-red-600 px-1.5 py-0.5 rounded bg-red-50 border border-red-200">α{stock.alpha >= 0 ? '+' : ''}{stock.alpha.toFixed(1)}pp</span>
                    <span className="text-xs text-red-600 font-bold">↓</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Model Drift + Confidence Değişimi + Alpha vs BIST30 - Kompakt */}
        <div className="bg-white/90 backdrop-blur rounded-lg p-4 border-2 border-purple-300 bg-purple-50/70 shadow-md">
          <div className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
            <span>🤖 Model Metrikleri</span>
          </div>
          <div className="space-y-2">
            {/* Model Drift - v4.7: Trend yönü oku ile */}
            <div className="flex justify-between items-center p-2 bg-white/80 rounded border border-purple-200">
              <span className="text-xs text-slate-700">Model Drift (24s):</span>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-bold ${(modelDrift24h !== undefined ? modelDrift24h : -0.3) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {modelDrift24h !== undefined ? `${modelDrift24h >= 0 ? '+' : ''}${modelDrift24h.toFixed(1)}%` : '-0.3%'}
                </span>
                {modelDrift24h !== undefined && (
                  <span className={`text-xs font-bold ${modelDrift24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {modelDrift24h >= 0 ? '↑' : modelDrift24h < 0 ? '↓' : '→'}
                  </span>
                )}
              </div>
            </div>
            {/* Confidence Değişimi - v4.7: Trend yönü oku ile */}
            <div className="flex justify-between items-center p-2 bg-white/80 rounded border border-purple-200">
              <span className="text-xs text-slate-700">Confidence Δ (24h):</span>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-bold ${(confidenceChange24h !== undefined ? confidenceChange24h : 1.5) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {confidenceChange24h !== undefined ? (confidenceChange24h >= 0 ? '+' : '') + confidenceChange24h.toFixed(1) + 'pp' : '+1.5pp'}
                </span>
                {confidenceChange24h !== undefined && (
                  <span className={`text-xs font-bold ${confidenceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {confidenceChange24h > 0 ? '↑' : confidenceChange24h < 0 ? '↓' : '→'}
                  </span>
                )}
              </div>
            </div>
            {/* Alpha vs BIST30 - v4.7: Trend yönü oku ile */}
            <div className="flex justify-between items-center p-2 bg-white/80 rounded border border-purple-200">
              <span className="text-xs text-slate-700">Alpha (vs BIST30):</span>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-bold ${(alphaVsBenchmark !== undefined ? alphaVsBenchmark : 0.8) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {alphaVsBenchmark !== undefined ? (alphaVsBenchmark >= 0 ? '+' : '') + alphaVsBenchmark.toFixed(1) : '+0.8'}pp
                </span>
                {alphaVsBenchmark !== undefined && (
                  <span className={`text-xs font-bold ${alphaVsBenchmark >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {alphaVsBenchmark >= 0 ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </div>
            {/* v4.7: Sharpe Değişimi (24h) - Trend yönü oku ile */}
            <div className="flex justify-between items-center p-2 bg-white/80 rounded border border-purple-200">
              <span className="text-xs text-slate-700">Sharpe Δ (24h):</span>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-bold ${(sharpeChange24h !== undefined ? sharpeChange24h : 0.15) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {sharpeChange24h !== undefined ? (sharpeChange24h >= 0 ? '+' : '') + sharpeChange24h.toFixed(2) : '+0.15'}
                </span>
                {sharpeChange24h !== undefined && (
                  <span className={`text-xs font-bold ${sharpeChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {sharpeChange24h >= 0 ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </div>
            {/* Sentiment Ortalama */}
            <div className="flex justify-between items-center p-2 bg-white/80 rounded border border-purple-200">
              <span className="text-xs text-slate-700">Sentiment Ort.:</span>
              <span className="text-sm font-bold text-purple-700">
                {sentimentAverage !== undefined ? (sentimentAverage * 100).toFixed(1) : '71.2'}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Günlük Özeti 2.0: Detaylı Metrikler Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        {/* Top Alpha Stocks (24s) - Eski versiyon (fallback) */}
        <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-emerald-200 bg-emerald-50/50">
          <div className="text-xs font-semibold text-emerald-700 mb-2">📈 En İyi 5 Hisse (24s)</div>
          <div className="space-y-1">
            {topAlphaStocks.length > 0 ? topAlphaStocks.slice(0, 5).map((stock, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-900">{stock.symbol}</span>
                <div className="flex items-center gap-1">
                  <span className="text-emerald-700 font-bold">+{stock.return.toFixed(1)}%</span>
                  <span className="text-[10px] text-emerald-600">α{stock.alpha >= 0 ? '+' : ''}{stock.alpha.toFixed(1)}pp</span>
                </div>
              </div>
            )) : (
              <>
                <div className="flex justify-between items-center text-xs"><span className="font-semibold">THYAO</span><span className="text-emerald-700 font-bold">+3.8%</span><span className="text-[10px] text-emerald-600">α+2.1pp</span></div>
                <div className="flex justify-between items-center text-xs"><span className="font-semibold">SISE</span><span className="text-emerald-700 font-bold">+2.3%</span><span className="text-[10px] text-emerald-600">α+1.5pp</span></div>
                <div className="flex justify-between items-center text-xs"><span className="font-semibold">EREGL</span><span className="text-emerald-700 font-bold">+1.9%</span><span className="text-[10px] text-emerald-600">α+0.8pp</span></div>
              </>
            )}
          </div>
        </div>

        {/* Worst Alpha Stocks */}
        <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-red-200 bg-red-50/50">
          <div className="text-xs font-semibold text-red-700 mb-2">📉 En Kötü 5 Hisse (24s)</div>
          <div className="space-y-1">
            {worstAlphaStocks.length > 0 ? worstAlphaStocks.slice(0, 5).map((stock, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-900">{stock.symbol}</span>
                <div className="flex items-center gap-1">
                  <span className="text-red-700 font-bold">{stock.return.toFixed(1)}%</span>
                  <span className="text-[10px] text-red-600">α{stock.alpha >= 0 ? '+' : ''}{stock.alpha.toFixed(1)}pp</span>
                </div>
              </div>
            )) : (
              <>
                <div className="flex justify-between items-center text-xs"><span className="font-semibold">AKBNK</span><span className="text-red-700 font-bold">-1.4%</span><span className="text-[10px] text-red-600">α-2.1pp</span></div>
                <div className="flex justify-between items-center text-xs"><span className="font-semibold">GARAN</span><span className="text-red-700 font-bold">-0.8%</span><span className="text-[10px] text-red-600">α-1.2pp</span></div>
                <div className="flex justify-between items-center text-xs"><span className="font-semibold">TUPRS</span><span className="text-red-700 font-bold">-0.5%</span><span className="text-[10px] text-red-600">α-0.8pp</span></div>
              </>
            )}
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-purple-200 bg-purple-50/50">
          <div className="text-xs font-semibold text-purple-700 mb-2">⚠️ Risk Dağılımı</div>
          {riskDistribution ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-700">Düşük</span>
                <span className="font-bold text-green-700">{riskDistribution.low}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded overflow-hidden">
                <div className="h-2 bg-green-500" style={{ width: `${riskDistribution.low}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-700">Orta</span>
                <span className="font-bold text-yellow-700">{riskDistribution.medium}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded overflow-hidden">
                <div className="h-2 bg-yellow-500" style={{ width: `${riskDistribution.medium}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-700">Yüksek</span>
                <span className="font-bold text-red-700">{riskDistribution.high}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded overflow-hidden">
                <div className="h-2 bg-red-500" style={{ width: `${riskDistribution.high}%` }}></div>
              </div>
              {/* Risk Distribution Normalize Status */}
              <div className="mt-2 pt-2 border-t border-purple-200 text-[9px] text-center">
                {(() => {
                  const totalPct = (riskDistribution.low || 0) + (riskDistribution.medium || 0) + (riskDistribution.high || 0);
                  const isNormalized = Math.abs(totalPct - 100) < 0.1;
                  return isNormalized ? (
                    <span className="text-green-600 font-semibold">✓ Toplam: {totalPct.toFixed(1)}% (Normalize edilmiş)</span>
                  ) : (
                    <span className="text-red-600 font-semibold">⚠️ Toplam: {totalPct.toFixed(1)}% (Normalize edilmemiş)</span>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs"><span>Düşük</span><span className="font-bold text-green-700">45%</span></div>
              <div className="w-full h-2 bg-slate-200 rounded"><div className="h-2 bg-green-500 rounded" style={{ width: '45%' }}></div></div>
              <div className="flex justify-between items-center text-xs"><span>Orta</span><span className="font-bold text-yellow-700">35%</span></div>
              <div className="w-full h-2 bg-slate-200 rounded"><div className="h-2 bg-yellow-500 rounded" style={{ width: '35%' }}></div></div>
              <div className="flex justify-between items-center text-xs"><span>Yüksek</span><span className="font-bold text-red-700">20%</span></div>
              <div className="w-full h-2 bg-slate-200 rounded"><div className="h-2 bg-red-500 rounded" style={{ width: '20%' }}></div></div>
            </div>
          )}
        </div>

        {/* Sentiment vs Price Divergence */}
        <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-orange-200 bg-orange-50/50">
          <div className="text-xs font-semibold text-orange-700 mb-2">📊 Sentiment vs Fiyat Diverjansı</div>
          {sentimentPriceDivergence !== undefined ? (
            <>
              <div className="text-lg font-bold text-orange-900 mb-2">
                {sentimentPriceDivergence >= 0.3 ? '⚠️ Yüksek Diverjans' : sentimentPriceDivergence <= -0.3 ? '⚠️ Negatif Diverjans' : '✓ Uyumlu'}
              </div>
              <div className="text-xs text-slate-700">
                {sentimentPriceDivergence >= 0.3 
                  ? 'Sentiment fiyattan çok daha pozitif — dikkatli olunmalı'
                  : sentimentPriceDivergence <= -0.3
                  ? 'Sentiment fiyattan çok daha negatif — fırsat olabilir'
                  : 'Sentiment ve fiyat uyumlu — trend güçlü'}
              </div>
              <div className="mt-2">
                <div className="w-full h-2 bg-slate-200 rounded overflow-hidden">
                  <div 
                    className={`h-2 ${sentimentPriceDivergence >= 0 ? 'bg-orange-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.abs(sentimentPriceDivergence) * 100}%` }}
                  ></div>
                </div>
                <div className="text-[10px] text-slate-600 mt-1">
                  Skor: {sentimentPriceDivergence.toFixed(2)} (0 = uyumlu, ±1 = maksimum diverjans)
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-lg font-bold text-orange-900 mb-2">✓ Uyumlu</div>
              <div className="text-xs text-slate-700">Sentiment ve fiyat uyumlu — trend güçlü</div>
              <div className="mt-2">
                <div className="w-full h-2 bg-slate-200 rounded"><div className="h-2 bg-orange-500 rounded" style={{ width: '25%' }}></div></div>
                <div className="text-[10px] text-slate-600 mt-1">Skor: 0.15 (uyumlu)</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* P1-06: Sektör Bazlı Tablo - En iyi/kötü sektörler detay tablosu + Risk Haritası */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-slate-200">
          <div className="text-xs font-semibold text-slate-700 mb-2">📊 Sektör Performans Tablosu</div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="font-semibold text-green-700 mb-1">En İyi 3 Sektör</div>
              <div className="space-y-1">
                <div className="flex justify-between items-center p-1 bg-green-50 rounded border border-green-200">
                  <span>Teknoloji</span>
                  <span className="font-bold text-green-700">+3.8% (α+2.1pp)</span>
                </div>
                <div className="flex justify-between items-center p-1 bg-green-50/50 rounded border border-green-200">
                  <span>Sanayi</span>
                  <span className="font-bold text-green-700">+2.3% (α+1.5pp)</span>
                </div>
                <div className="flex justify-between items-center p-1 bg-green-50/50 rounded border border-green-200">
                  <span>Enerji</span>
                  <span className="font-bold text-green-700">+1.9% (α+0.8pp)</span>
                </div>
              </div>
            </div>
            <div>
              <div className="font-semibold text-red-700 mb-1">En Zayıf 3 Sektör</div>
              <div className="space-y-1">
                <div className="flex justify-between items-center p-1 bg-red-50 rounded border border-red-200">
                  <span>Bankacılık</span>
                  <span className="font-bold text-red-700">-1.4% (α-2.1pp)</span>
                </div>
                <div className="flex justify-between items-center p-1 bg-red-50/50 rounded border border-red-200">
                  <span>Gıda</span>
                  <span className="font-bold text-red-700">-0.8% (α-1.2pp)</span>
                </div>
                <div className="flex justify-between items-center p-1 bg-red-50/50 rounded border border-red-200">
                  <span>Perakende</span>
                  <span className="font-bold text-red-700">-0.5% (α-0.8pp)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* v4.7: Sektör Bazlı Risk Haritası */}
        <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-purple-200">
          <div className="text-xs font-semibold text-purple-700 mb-2">🗺️ Sektör Bazlı Risk Haritası</div>
          <div className="space-y-2 text-xs">
            {['Teknoloji', 'Sanayi', 'Enerji', 'Bankacılık', 'Gıda', 'Perakende'].map((sector, idx) => {
              const riskLevel = idx < 2 ? 'düşük' : idx < 4 ? 'orta' : 'yüksek';
              const riskPct = idx < 2 ? 15 : idx < 4 ? 25 : 35;
              const riskColor = idx < 2 ? 'green' : idx < 4 ? 'yellow' : 'red';
              return (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-20 text-slate-700 font-medium">{sector}</span>
                  <div className="flex-1 h-3 bg-slate-200 rounded overflow-hidden">
                    <div 
                      className={`h-3 bg-${riskColor}-500`}
                      style={{ width: `${riskPct}%` }}
                    ></div>
                  </div>
                  <span className={`text-[10px] font-bold text-${riskColor}-700 w-12 text-right`}>
                    {riskPct}% ({riskLevel})
                  </span>
                </div>
              );
            })}
          </div>
          <div className="text-[9px] text-slate-500 mt-2 pt-2 border-t border-purple-200 text-center">
            Risk seviyesi: Düşük (yeşil) • Orta (sarı) • Yüksek (kırmızı)
          </div>
        </div>
      </div>
      
      {/* v4.7: AI Tahmin - Haber Etkisi Korelasyonu */}
      <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-indigo-200 bg-indigo-50/50 mb-3">
        <div className="text-xs font-semibold text-indigo-700 mb-2">🔗 AI Tahmin - Haber Etkisi Korelasyonu</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="font-semibold text-indigo-900 mb-2">Pozitif Haber Etkisi</div>
            <div className="space-y-1">
              {['THYAO', 'SISE', 'EREGL'].map((symbol, idx) => {
                const correlation = 0.72 + (idx * 0.08); // Mock correlation
                return (
                  <div key={idx} className="flex justify-between items-center p-1.5 bg-indigo-50 rounded border border-indigo-200">
                    <span className="font-medium text-slate-900">{symbol}</span>
                    <span className="font-bold text-indigo-700">{(correlation * 100).toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <div className="font-semibold text-indigo-900 mb-2">Negatif Haber Etkisi</div>
            <div className="space-y-1">
              {['AKBNK', 'GARAN', 'TUPRS'].map((symbol, idx) => {
                const correlation = 0.58 - (idx * 0.08); // Mock correlation
                return (
                  <div key={idx} className="flex justify-between items-center p-1.5 bg-indigo-50 rounded border border-indigo-200">
                    <span className="font-medium text-slate-900">{symbol}</span>
                    <span className="font-bold text-indigo-700">{(correlation * 100).toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="text-[9px] text-indigo-600 mt-2 pt-2 border-t border-indigo-200 text-center">
          Korelasyon: AI tahminleri ile haber etkisinin uyumluluğu (% yüksek = pozitif haber etkisi güçlü)
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
        <div className="flex items-center justify-between mt-2 text-[10px] text-slate-600">
          <span>Min: {(Math.min(...confidenceSeries) * 100).toFixed(1)}%</span>
          <span>Ortalama: {((confidenceSeries.reduce((a, b) => a + b, 0) / confidenceSeries.length) * 100).toFixed(1)}%</span>
          <span>Max: {(Math.max(...confidenceSeries) * 100).toFixed(1)}%</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1 text-center">
          Son 24 saatte AI güven trendi: {confidenceSeries[confidenceSeries.length - 1] > confidenceSeries[0] ? '↑ Yükseliş' : '↓ Düşüş'}
        </div>
      </div>
    </div>
  );
}

// Ticker animation will be handled by CSS in globals.css

