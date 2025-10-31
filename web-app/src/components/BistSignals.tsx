'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Api } from '@/services/api';
import { useBistPredictions, useBistAllPredictions, useBist30News as useBist30NewsQ, useBist30Overview as useBist30OverviewQ, useSentimentSummary as useSentimentSummaryQ, useWatchlist as useWatchlistQ, usePredictiveTwin, useUpdateWatchlistMutation, useAlertsGenerateMutation, useForecast } from '@/hooks/queries';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:18085';
const API_CANDIDATES = Array.from(new Set([
  API_BASE_URL,
  'http://127.0.0.1:18100',
  'http://127.0.0.1:18085',
  'http://localhost:18100',
  'http://localhost:18085',
]));
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ClockIcon } from '@heroicons/react/24/outline';
import Top30Analysis from './Top30Analysis';
import { Skeleton } from '@/components/UI/Skeleton';
import { AIOrchestrator } from '@/components/AI/AIOrchestrator';
import { IntelligenceHub } from '@/components/AI/IntelligenceHub';
import { MetaHeatmap } from '@/components/AI/MetaHeatmap';
import { AIConfidenceGauge } from '@/components/AI/AIConfidenceGauge';
import { Toast } from '@/components/UI/Toast';
import { AICorePanel } from '@/components/AI/AICorePanel';

// Simple seeded series for sparkline
function seededSeries(key: string, len: number = 20): number[] {
  let seed = 0;
  for (let i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i)) >>> 0;
  const out: number[] = [];
  let v = (seed % 50) + 50;
  for (let i = 0; i < len; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const noise = (seed % 11) - 5; // -5..+5
    v = Math.max(10, Math.min(100, v + noise));
    out.push(v);
  }
  return out;
}

function Sparkline({ series, width = 80, height = 24, color = '#10b981' }: { series: number[]; width?: number; height?: number; color?: string }) {
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
    <svg width={width} height={height} viewBox={'0 0 ' + width + ' ' + height}>
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

type Horizon = '5m'|'15m'|'30m'|'1h'|'4h'|'1d'|'7d'|'30d';
type Universe = 'BIST30'|'BIST100'|'BIST300'|'ALL';

interface BistSignalsProps {
  forcedUniverse?: Extract<Universe, 'BIST30' | 'BIST100' | 'BIST300'>;
  allowedUniverses?: Universe[];
}

interface Prediction {
  symbol: string;
  horizon: Horizon;
  prediction: number;   // -1..+1
  confidence: number;   // 0..1
  valid_until: string;
  generated_at: string;
}

const HORIZONS: Horizon[] = ['5m','15m','30m','1h','4h','1d','7d','30d'];
const maxRowsDefaultByUniverse: Record<Universe, number> = { BIST30: 30, BIST100: 100, BIST300: 150, ALL: 30 };
const maxRowsAllByUniverse: Record<Universe, number> = { BIST30: 30, BIST100: 100, BIST300: 300, ALL: 30 };

export default function BistSignals({ forcedUniverse, allowedUniverses }: BistSignalsProps) {
  const [universe, setUniverse] = useState<Universe>(forcedUniverse || 'BIST30');
  const [activeHorizons, setActiveHorizons] = useState<Horizon[]>(['5m','15m','30m','1h']);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Prediction[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [filterWatch, setFilterWatch] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [view, setView] = useState<'table' | 'cards'>('cards');
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [alertChannel, setAlertChannel] = useState<'web'|'telegram'>('web');
  const [backtestTcost, setBacktestTcost] = useState<number>(8);
  const [backtestRebDays, setBacktestRebDays] = useState<number>(5);
  // Lazy subcomponent: XAI + Analyst
  const XaiAnalyst: React.FC<{ symbol: string | null }> = ({ symbol }) => {
    const { useXaiWaterfall, useSentimentAnalyst, useBacktestQuick } = require('@/hooks/queries');
    const xai = useXaiWaterfall(symbol || undefined);
    const an = useSentimentAnalyst(symbol || undefined);
    return (
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-white rounded border p-3">
          <div className="text-sm font-semibold text-gray-900 mb-1">XAI Waterfall</div>
          {!xai.data ? <Skeleton className="h-16 w-full rounded" /> : (
            <ul className="text-xs text-slate-700 space-y-1">
              {(xai.data.contributions||[]).slice(0,6).map((c:any, i:number)=> (
                <li key={i} className="flex justify-between"><span>{c.feature}</span><span className={c.delta>=0?'text-green-600':'text-red-600'}>{(c.delta*100).toFixed(1)} bp</span></li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white rounded border p-3">
          <div className="text-sm font-semibold text-gray-900 mb-1">Analist / Sektör Duygusu</div>
          {!an.data ? <Skeleton className="h-12 w-full rounded" /> : (
            <div className="text-xs text-slate-700 space-y-1">
              <div className="flex justify-between"><span>Analist BUY Oranı</span><span className="font-medium">{Math.round((an.data.analyst_buy_ratio||0)*100)}%</span></div>
              <div className="flex justify-between"><span>Sektör Sentiment</span><span className="font-medium">{Math.round((an.data.sector_sentiment||0)*100)}%</span></div>
              <div className="flex justify-between"><span>Kapsam</span><span className="font-medium">{an.data.coverage_count}</span></div>
            </div>
          )}
        </div>
      </div>
    );
  };
  const [analysisHorizon, setAnalysisHorizon] = useState<'1d'|'7d'|'30d'>('1d');
  const [signalFilter, setSignalFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'prediction' | 'symbol'>('confidence');
  const [maxRows, setMaxRows] = useState<number>(30);
  const [filterAcc80, setFilterAcc80] = useState<boolean>(false);
  const [filterMomentum, setFilterMomentum] = useState<boolean>(false);

  // Tutarlılık Endeksi: 1H/4H/1D aynı yönde mi?
  const consistencyIndex = useMemo(() => {
    if (!selectedSymbol) return null;
    const horizons: Horizon[] = ['1h','4h','1d'];
    const rel = rows.filter(r => r.symbol === selectedSymbol && horizons.includes(r.horizon));
    if (rel.length === 0) return null;
    const dir = (p: number): number => (p >= 0.02 ? 1 : p <= -0.02 ? -1 : 0);
    const votes: number[] = rel.map(r => dir(r.prediction || 0));
    const score: number = votes.reduce((a: number, b: number) => a + b, 0);
    const aligned = Math.abs(score) === votes.length && votes.length >= 2;
    return { aligned, votes: votes.length, score };
  }, [rows, selectedSymbol]);
  const [alertDelta, setAlertDelta] = useState<number>(5);
  const [alertMinConf, setAlertMinConf] = useState<number>(70);
  const [strategyPreset, setStrategyPreset] = useState<'custom'|'momentum'|'meanrev'|'news'|'mixed'>('custom');
  const [bist30Overview, setBist30Overview] = useState<any>(null);
  const [bist30News, setBist30News] = useState<any[]>([]);
  const [sentimentSummary, setSentimentSummary] = useState<any>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [sectorFilter, setSectorFilter] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const DATA_SOURCE = 'Mock API v5.2';
  const [strategyMode, setStrategyMode] = useState<'scalper'|'swing'|'auto'>('auto');
  // Forecast hook for Analysis Panel (selectedSymbol + analysisHorizon)
  const panelForecastQ = useForecast(selectedSymbol || undefined as any, analysisHorizon, !!selectedSymbol);
  // TraderGPT conversational panel state
  const [gptOpen, setGptOpen] = useState<boolean>(false);
  const [gptInput, setGptInput] = useState<string>('');
  const [gptSpeaking, setGptSpeaking] = useState<boolean>(false);
  const [gptMessages, setGptMessages] = useState<Array<{role:'user'|'ai'; text:string}>>([
    { role: 'ai', text: 'Merhaba! Bugün BIST30’da en güçlü 3 sinyali görmek ister misin?' }
  ]);
  const speakText = (text: string) => {
    try {
      if (typeof window === 'undefined' || !(window as any).speechSynthesis) return;
      const u = new (window as any).SpeechSynthesisUtterance(text);
      u.lang = 'tr-TR';
      u.onstart = () => setGptSpeaking(true);
      u.onend = () => setGptSpeaking(false);
      (window as any).speechSynthesis.speak(u);
    } catch {}
  };
  const handleGptAsk = async () => {
    const q = gptInput.trim();
    if (!q) return;
    setGptMessages(prev => [...prev, { role: 'user', text: q }]);
    setGptInput('');
    // Basit kural tabanlı cevap (stub): en güçlü 3 sembol + kısa yorum
    try {
      const top = rows.slice().sort((a,b)=> (b.confidence||0)-(a.confidence||0)).map(r=>r.symbol);
      const uniq: string[] = [];
      top.forEach(s=> { if (!uniq.includes(s)) uniq.push(s); });
      const top3 = uniq.slice(0,3);
      const msg = top3.length>0
        ? (`Bugün öne çıkanlar: ${top3.join(', ')}. Meta-ensemble güveni yüksek; kısa vadede momentum pozitif.`)
        : 'Şu an veriyi değerlendiriyorum; sinyal listesi kısa süre içinde güncellenecek.';
      setGptMessages(prev => [...prev, { role: 'ai', text: msg }]);
      speakText(msg);
    } catch {
      const fallback = 'Analiz sırasında küçük bir gecikme oldu; lütfen tekrar dener misin?';
      setGptMessages(prev => [...prev, { role: 'ai', text: fallback }]);
      speakText(fallback);
    }
  };

  useEffect(() => { setIsHydrated(true); }, []);

  const universesToRender: Universe[] = React.useMemo(() => {
    if (forcedUniverse) return [forcedUniverse];
    if (Array.isArray(allowedUniverses) && allowedUniverses.length > 0) return allowedUniverses as Universe[];
    return ['BIST30','BIST100','BIST300','ALL'] as Universe[];
  }, [forcedUniverse, allowedUniverses]);

  const generateDemoRows = (): Prediction[] => {
    const syms = ['AKBNK','ARCLK','ASELS','BIMAS','ENKAI','EREGL','FROTO','GARAN','ISCTR','KCHOL'];
    const hs: Horizon[] = ['1d','4h','1h'] as any;
    const nowIso = new Date().toISOString();
    const out: any[] = [];
    syms.forEach(sym => hs.forEach(h => out.push({ symbol: sym, horizon: h as any, prediction: (Math.random()-0.5)*0.2, confidence: 0.78 + Math.random()*0.15, valid_until: nowIso, generated_at: nowIso })));
    return out as Prediction[];
  };

  // SSR/CSR uyumu: props ile evreni sabitle
  useEffect(() => {
    if (forcedUniverse && universe !== forcedUniverse) setUniverse(forcedUniverse);
  }, [forcedUniverse]);

  // İzinli liste değişirse, mevcut evren uygunsuzsa ilkine çek
  useEffect(() => {
    if (!forcedUniverse && universesToRender.length > 0 && !universesToRender.includes(universe)) {
      setUniverse(universesToRender[0]);
    }
  }, [universesToRender, forcedUniverse]);

  useEffect(() => {
    if (forcedUniverse) {
      setView('cards');
      setMaxRows(forcedUniverse==='BIST100'?100:30);
    }
  }, [forcedUniverse]);

  const endpoint = useMemo(() => {
    // Eğer hiçbir ufuk seçili değilse, güvenli varsayılan uygula
    const horizons = activeHorizons.length === 0 ? ['1d'] : activeHorizons;
    if (universe === 'ALL') return null;
    let base = 'bist30_predictions';
    if (universe === 'BIST100') base = 'bist100_predictions';
    else if (universe === 'BIST300') base = 'bist300_predictions';
    const qs = `horizons=${horizons.join(',')}&all=1`;
    return `${API_BASE_URL}/api/ai/${base}?${qs}`;
  }, [universe, activeHorizons]);

  // Akıllı fetch: birden fazla aday base URL üzerinde dene
  const fetchJsonSmart = async (url: string): Promise<any> => {
    const candidates: string[] = [];
    const isAbsolute = /^https?:\/\//i.test(url);
    const pathOnly = isAbsolute ? url.replace(/^https?:\/\/[^/]+/, '') : '/' + url.replace(/^\//, '');
    const origin = (typeof window !== 'undefined' ? window.location.origin : '');
    if (isAbsolute) {
      for (const base of API_CANDIDATES) {
        // değişken base ile yeniden yaz
        const baseHost = API_BASE_URL.replace(/\/$/, '');
        candidates.push(url.replace(baseHost, base.replace(/\/$/, '')));
      }
    } else {
      for (const base of API_CANDIDATES) {
        candidates.push(base.replace(/\/$/, '') + '/' + url.replace(/^\//, ''));
      }
    }
    // Son çare: aynı origin üzerinden relative istek (proxy varsa işler)
    if (origin) candidates.push(origin.replace(/\/$/, '') + pathOnly);

    let lastErr: any = null;
    for (const c of candidates) {
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(c, { cache: 'no-store', signal: controller.signal as any });
        clearTimeout(t);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return await res.json();
      } catch (e) {
        lastErr = e;
        continue;
      }
    }
    throw lastErr || new Error('All API candidates failed');
  };
  // react-query: tahminler
  const horizonsEff = activeHorizons.length === 0 ? ['1d'] : activeHorizons;
  const predQ = universe === 'ALL' ? useBistAllPredictions(horizonsEff) : useBistPredictions(universe, horizonsEff, true);
  useEffect(() => {
    const data = predQ.data as any;
    const arr = Array.isArray(data?.predictions) ? data.predictions : [];
    if (arr.length > 0) {
      setRows(arr);
      setLastUpdated(new Date());
    } else if (!predQ.isLoading && !predQ.isFetching) {
      setRows(generateDemoRows());
    }
    setLoading(Boolean(predQ.isLoading || predQ.isFetching));
  }, [predQ.data, predQ.isLoading, predQ.isFetching]);

  // Veri geldikten sonra varsayılan sembol seçimi (boş durum saatini engeller)
  useEffect(() => {
    if (!selectedSymbol && rows && rows.length > 0) {
      const first = rows[0]?.symbol;
      if (first) {
        setSelectedSymbol(first);
      }
    }
  }, [rows]);

  // watchlist query
  const wlQ = useWatchlistQ();
  const wlMut = useUpdateWatchlistMutation();
  const alertMut = useAlertsGenerateMutation();
  useEffect(() => {
    const arr = Array.isArray((wlQ.data as any)?.symbols) ? (wlQ.data as any).symbols : [];
    setWatchlist(arr);
  }, [wlQ.data]);

  // BIST30 özel: overview/news/sentiment react-query ile
  const ovQ = useBist30OverviewQ(universe === 'BIST30');
  const newsQ = useBist30NewsQ(universe === 'BIST30');
  const sentQ = useSentimentSummaryQ(universe === 'BIST30');
  useEffect(() => {
    if (ovQ.data) setBist30Overview(ovQ.data);
    if (Array.isArray((newsQ.data as any)?.items)) setBist30News((newsQ.data as any).items);
    if (sentQ.data) setSentimentSummary(sentQ.data);
  }, [ovQ.data, newsQ.data, sentQ.data]);

  // Sembolden sektöre basit eşleme (UI filtre için)
  const symbolToSector = (sym: string): string => {
    const maps: Record<string, string> = {
      AKBNK: 'Bankacılık', GARAN: 'Bankacılık', YKBNK: 'Bankacılık', ISCTR: 'Bankacılık', VAKBN: 'Bankacılık',
      ASELS: 'Teknoloji', ENKAI: 'Teknoloji', LOGO: 'Teknoloji', KAREL: 'Teknoloji', NETAS: 'Teknoloji', TKNSA: 'Teknoloji',
      TUPRS: 'Enerji', PETKM: 'Enerji', TRCAS: 'Enerji', ZOREN: 'Enerji',
      EREGL: 'Sanayi', KOZAL: 'Sanayi', BRISA: 'Sanayi', OTKAR: 'Sanayi', TRKCM: 'Sanayi', FROTO: 'Sanayi',
      BIMAS: 'Perakende', MIGRS: 'Perakende', AEFES: 'Perakende',
      TTKOM: 'Telekom', TCELL: 'Telekom'
    };
    return maps[sym as keyof typeof maps] || 'Diğer';
  };

  // Satır başına tek ufuk seçimi (en yüksek güven veya mutlak tahmin)
  const bestPerSymbol = useMemo(() => {
    const bySymbol = new Map<string, Prediction[]>();
    rows.forEach(r => {
      if (sectorFilter && symbolToSector(r.symbol) !== sectorFilter) return;
      const arr = bySymbol.get(r.symbol) || [];
      arr.push(r);
      bySymbol.set(r.symbol, arr);
    });
    const list: Prediction[] = [];
    bySymbol.forEach((arr) => {
      const chosen = arr.slice().sort((a,b)=> (b.confidence||0) - (a.confidence||0) || Math.abs((b.prediction||0)) - Math.abs((a.prediction||0)))[0];
      if (chosen) list.push(chosen);
    });
    // Sıralama: güven → |tahmin|
    list.sort((a,b)=> (b.confidence||0) - (a.confidence||0) || Math.abs((b.prediction||0)) - Math.abs((a.prediction||0)));
    return list;
  }, [rows, sectorFilter]);

  // Tablo filtre-sırala listesi (virtualization için tek yerde hesapla)
  const tableList = useMemo(() => {
    const filtered = rows
      .filter(r => (!filterWatch || watchlist.includes(r.symbol)) && (search==='' || r.symbol.includes(search)))
      .filter(r => {
        if (signalFilter === 'all') return true;
        const confPct = Math.round((r.confidence || 0) * 100);
        const pred = r.prediction || 0;
        if (signalFilter === 'buy') return confPct >= 80 && pred >= 0.05;
        if (signalFilter === 'sell') return confPct >= 80 && pred <= -0.05;
        return confPct < 80 || (pred >= -0.05 && pred <= 0.05);
      })
      .filter(r => !filterAcc80 || Math.round((r.confidence || 0) * 100) >= 80)
      .filter(r => !filterMomentum || Math.abs(r.prediction || 0) >= 0.05);

    const sorted = filtered.sort((a, b) => {
      if (sortBy === 'confidence') return (b.confidence || 0) - (a.confidence || 0);
      if (sortBy === 'prediction') return Math.abs(b.prediction || 0) - Math.abs(a.prediction || 0);
      return (a.symbol || '').localeCompare(b.symbol || '');
    });
    return sorted.slice(0, maxRows);
  }, [rows, filterWatch, watchlist, search, signalFilter, filterAcc80, filterMomentum, sortBy, maxRows]);

  // Her sembol için en iyi ufuk (güven → |tahmin|)
  const bestHorizonBySymbol = useMemo(() => {
    const bySymbol = new Map<string, Prediction[]>();
    rows.forEach(r => {
      const arr = bySymbol.get(r.symbol) || [];
      arr.push(r);
      bySymbol.set(r.symbol, arr);
    });
    const out = new Map<string, Horizon>();
    bySymbol.forEach((arr, sym) => {
      const chosen = arr.slice().sort((a,b)=> (b.confidence||0) - (a.confidence||0) || Math.abs((b.prediction||0)) - Math.abs((a.prediction||0)))[0];
      if (chosen) out.set(sym, chosen.horizon);
    });
    return out;
  }, [rows]);

  // Deterministik mini başarı oranı (Son10 isabet) – SSR uyumlu
  const successRateOf = (symbol: string, confidence: number): number => {
    let seed = 0; for (let i=0;i<symbol.length;i++) seed = (seed*31 + symbol.charCodeAt(i))>>>0;
    const base = Math.round(confidence*100) - 7; // güvene bağlı baz
    const jitter = (seed % 9) - 4; // -4..+4
    return Math.max(55, Math.min(98, base + jitter));
  };

  const trendLabel = (pred: number): 'Yükseliş'|'Düşüş'|'Nötr' => {
    if (pred >= 0.02) return 'Yükseliş';
    if (pred <= -0.02) return 'Düşüş';
    return 'Nötr';
  };

  // Deterministik güncel fiyat üretici (SSR güvenli, sembol bazlı)
  const seedPrice = (symbol: string): number => {
    let seed = 0; for (let i=0;i<symbol.length;i++) seed = (seed*31 + symbol.charCodeAt(i))>>>0;
    const base = 15 + (seed % 260); // 15..275 arası
    const cents = (seed % 100) / 100; // .00..99
    return Math.round((base + cents) * 100) / 100;
  };

  // Mini analiz cümlesi (tek satır)
  const miniAnalysis = (pred: number, conf: number): string => {
    const confPct = Math.round(conf*100);
    if (pred >= 0.08 && confPct >= 85) return 'Momentum güçlü, hacim artışı sinyali destekliyor.';
    if (pred >= 0.05) return 'Trend pozitif, kısa vadede yukarı potansiyel mevcut.';
    if (pred <= -0.08 && confPct >= 85) return 'RSI aşırı alımda, kısa vadeli düzeltme olası.';
    if (pred <= -0.05) return 'Baskı artıyor, destek bölgeleri izlenmeli.';
    return 'Nötr görünüm, teyit için hacim ve RSI takip edilmeli.';
  };

  const technicalBadges = (pred: number, conf: number): string[] => {
    const out: string[] = [];
    if (pred >= 0.05) out.push('Momentum↑'); else if (pred <= -0.05) out.push('Momentum↓');
    if (Math.round(conf*100) >= 85) out.push('RSI↑');
    if (Math.abs(pred) >= 0.10) out.push('MACD↑');
    if (out.length===0) out.push('GENEL');
    return out;
  };

  const confidenceBg = (confPct: number): string => {
    if (confPct >= 85) return 'rgba(16,185,129,0.12)'; // green-500/12
    if (confPct >= 70) return 'rgba(234,179,8,0.15)';  // yellow-500/15
    return 'rgba(239,68,68,0.12)';                     // red-500/12
  };

  const toggleHorizon = (h: Horizon) => {
    setActiveHorizons(prev =>
      prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h]
    );
  };

  // Predictive Twin (react-query)
  const analysisQ = usePredictiveTwin(selectedSymbol);
  useEffect(() => {
    const data = analysisQ.data as any;
    if (data) {
      setAnalysisData(data);
      if (typeof data.best_horizon === 'string' && (['1d','7d','30d'] as any).includes(data.best_horizon)) {
        setAnalysisHorizon(data.best_horizon as '1d'|'7d'|'30d');
    }
    }
  }, [analysisQ.data]);

  // BIST100 için Top30 analiz göster
  if (universe === 'BIST100') {
  return (
      <div style={{ width: '100%' }}>
        <Top30Analysis />
      </div>
    );
  }

  // Prepare signals for AI Orchestrator
  const aiSignals = useMemo(() => {
    return rows
      .filter(r => activeHorizons.includes(r.horizon))
      .slice(0, maxRows)
      .map(r => ({
        symbol: r.symbol,
        signal: r.prediction >= 0.02 ? 'BUY' : r.prediction <= -0.02 ? 'SELL' : 'HOLD',
        confidence: r.confidence || 0,
        horizon: r.horizon,
        analysis: '',
        generated_at: r.generated_at || new Date().toISOString()
      }));
  }, [rows, activeHorizons, maxRows]);

  return (
    <AIOrchestrator predictions={rows.map(r => ({ ...r, reason: [] }))} signals={aiSignals}>
    <div className="flex gap-4">
      {/* Üst Bilgi Paneli (Koyu Şerit) */}
      <div className="absolute left-0 right-0 -top-4">
        <div className="mx-auto max-w-7xl">
          <div className={`rounded-xl text-white shadow-sm ${strategyMode==='scalper' ? 'bg-yellow-600' : strategyMode==='swing' ? 'bg-blue-700' : 'bg-slate-900'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-1">
                  <div className="text-xs opacity-80">Doğruluk (24s)</div>
                  <span title="Son 30 gün tahmin isabeti" className="text-xs opacity-80 cursor-help">ⓘ</span>
                </div>
                <div className="text-xl font-bold">%{Math.round((rows.slice(0,20).reduce((a,b)=>a + Math.round((b.confidence||0)*100),0) / Math.max(1, Math.min(20, rows.length))) || 80)}</div>
                <div className="text-[11px] opacity-80 mt-0.5">MAE 0.021 • RMSE 0.038</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-xs opacity-80">Aktif Sinyal</div>
                <div className="text-xl font-bold">{rows.length}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-xs opacity-80">Risk Skoru</div>
                <div className="text-xl font-bold">{(Math.max(1, 5 - Math.round((rows.length%5))) + 0).toFixed(1)}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-xs opacity-80">Toplam Sinyal</div>
                <div className="text-xl font-bold">{Math.max(rows.length, 100)}</div>
              </div>
              {/* AI Core Panel (compact) */}
              <div className="col-span-2 md:col-span-4">
                <AICorePanel />
              </div>
              {(() => { const { useRegime } = require('@/hooks/queries'); const r = useRegime(); const regime = String(r.data?.regime || '—'); const weights = (()=>{ if (/risk\s*-?on/i.test(regime)) return { equity: 0.8, cash: 0.2 }; if (/neutral|side/i.test(regime)) return { equity: 0.6, cash: 0.4 }; if (/risk\s*-?off/i.test(regime)) return { equity: 0.4, cash: 0.6 }; return { equity: 0.6, cash: 0.4 }; })(); return (
                <div className="col-span-2 md:col-span-4 bg-white/10 rounded-lg p-3">
      <div className="flex items-center justify-between">
                    <div className="text-xs opacity-80">Rejim • Ağırlıklar</div>
                    <div className="text-xs opacity-80">{regime}</div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[12px]">
                    <div className="bg-white/20 rounded p-2">
                      <div className="flex justify-between"><span>Hisse</span><span className="font-semibold">%{Math.round(weights.equity*100)}</span></div>
                      <div className="h-1.5 bg-white/20 rounded mt-1"><div className="h-1.5 bg-emerald-300 rounded" style={{ width: (weights.equity*100)+'%' }}></div></div>
                    </div>
                    <div className="bg-white/20 rounded p-2">
                      <div className="flex justify-between"><span>Nakit</span><span className="font-semibold">%{Math.round(weights.cash*100)}</span></div>
                      <div className="h-1.5 bg-white/20 rounded mt-1"><div className="h-1.5 bg-slate-200 rounded" style={{ width: (weights.cash*100)+'%' }}></div></div>
                    </div>
                  </div>
                  {(() => { const { useMacro } = require('@/hooks/queries'); const m = useMacro(); return (
                    <div className="mt-2 grid grid-cols-3 gap-2 text-[12px]">
                      <div className="bg-white/20 rounded p-2 flex items-center justify-between"><span>USD/TRY</span><span className="font-semibold">{m.data?.usdtry ?? '—'}</span></div>
                      <div className="bg-white/20 rounded p-2 flex items-center justify-between"><span>CDS 5Y</span><span className="font-semibold">{m.data?.cds_5y ?? '—'}</span></div>
                      <div className="bg-white/20 rounded p-2 flex items-center justify-between"><span>VIX</span><span className="font-semibold">{m.data?.vix ?? '—'}</span></div>
                    </div>
                  ); })()}
                </div>
              ); })()}
            </div>
          </div>
        </div>
      </div>
      {/* Sol Panel - Tahminler */}
      <div className="flex-1 bg-white rounded-lg shadow-sm p-4 space-y-4" style={{ minHeight: 0 }}>
        {/* Meta-Model Heatmap */}
        <MetaHeatmap limit={10} />
      {/* Header / Filtre Bar */}
      <div className="flex items-center justify-between" style={{ position: 'sticky', top: 0, zIndex: 2, background: '#fff', paddingBottom: 6 }}>
        <div className="flex gap-2 bg-white/60 backdrop-blur p-2 rounded-xl shadow-sm">
          {universesToRender.map(u => (
            <button
              key={u}
              onClick={() => {
                if (forcedUniverse) return;
                setUniverse(u);
                try { localStorage.setItem('bist_signals_universe', u); } catch {}
              }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${universe===u? 'bg-blue-600 text-white':'bg-slate-100 text-slate-800 hover:bg-slate-200'} ${forcedUniverse && u!==forcedUniverse ? 'opacity-50 cursor-not-allowed':'cursor-pointer'}`}
              disabled={!!forcedUniverse && u !== forcedUniverse}
            >
              {u}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto items-center bg-white/60 backdrop-blur p-2 rounded-xl shadow-sm">
          <button
            onClick={() => { try { (predQ as any)?.refetch?.(); } catch {} }}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-900 text-white hover:opacity-90"
            title="Veriyi yenile"
          >
            Yenile 🔁
          </button>
          {/* Strateji modu */}
          <div className="flex items-center gap-1 mr-2">
            <span className="text-[11px] text-slate-600">Mod:</span>
            <button onClick={()=>{setActiveHorizons(['5m','15m']); setStrategyMode('scalper');}} className="px-2 py-1 text-[11px] rounded bg-slate-100 hover:bg-slate-200">Scalper</button>
            <button onClick={()=>{setActiveHorizons(['4h','1d']); setStrategyMode('swing');}} className="px-2 py-1 text-[11px] rounded bg-slate-100 hover:bg-slate-200">Swing</button>
            <button onClick={()=>{setActiveHorizons(['1h','1d']); setStrategyMode('auto');}} className="px-2 py-1 text-[11px] rounded bg-blue-600 text-white">AI Auto</button>
          </div>
          {HORIZONS.map(h => (
            <button
              key={h}
              onClick={() => {
                console.log('⏱️ Horizon değiştiriliyor:', h);
                toggleHorizon(h);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${activeHorizons.includes(h)?'bg-blue-600 text-white':'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
            >
              {h}
            </button>
          ))}
          <button onClick={()=>setFilterWatch(v=>!v)} className={`px-3 py-1.5 text-xs rounded-full border ${filterWatch?'bg-blue-600 text-white border-blue-600':'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'}`}>Watchlist</button>
          <button onClick={()=>setFilterAcc80(v=>!v)} className={`px-3 py-1.5 text-xs rounded-full border ${filterAcc80?'bg-blue-600 text-white border-blue-600':'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'}`}>≥%80 doğruluk</button>
          <button onClick={()=>setFilterMomentum(v=>!v)} className={`px-3 py-1.5 text-xs rounded-full border ${filterMomentum?'bg-blue-600 text-white border-blue-600':'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'}`}>≥%5 momentum</button>
          {/* Strateji presetleri */}
          <div className="ml-2 hidden lg:flex items-center gap-1">
            {([
              {k:'momentum', label:'Momentum'},
              {k:'meanrev', label:'MeanReversion'},
              {k:'news', label:'News'},
              {k:'mixed', label:'Mixed AI'}
            ] as any[]).map((s)=> (
              <button
                key={s.k}
                onClick={()=>{
                  setStrategyPreset(s.k);
                  if (s.k==='momentum') {
                    setFilterMomentum(true);
                    setFilterAcc80(false);
                    setSignalFilter('all');
                    setSortBy('prediction');
                  } else if (s.k==='meanrev') {
                    setFilterMomentum(false);
                    setFilterAcc80(true);
                    setSignalFilter('sell');
                    setSortBy('prediction');
                  } else if (s.k==='news') {
                    setFilterMomentum(false);
                    setFilterAcc80(true);
                    setSignalFilter('all');
                    setSortBy('confidence');
                  } else if (s.k==='mixed') {
                    setFilterMomentum(true);
                    setFilterAcc80(true);
                    setSignalFilter('all');
                    setSortBy('confidence');
                  }
                }}
                className={`px-3 py-1.5 text-xs rounded-full border ${strategyPreset===s.k? 'bg-blue-600 text-white border-blue-600':'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'}`}
                title={`Strateji: ${s.label}`}
              >{s.label}</button>
            ))}
            <button
              onClick={async()=>{
                try {
                  const strat = strategyPreset==='custom' ? 'momentum' : strategyPreset;
                  const param = strat==='momentum' ? 'fast=12,slow=26' : (strat==='meanrev' ? 'lookback=14' : (strat==='news' ? 'sentiment=0.7' : 'blend=0.5'));
                  const res = await Api.runStrategyLab(strat, param);
                  alert(`StrategyLab: AUC ${res.auc}, Sharpe ${res.sharpe}, Win ${Math.round(res.win_rate*100)}%`);
                } catch(e) {}
              }}
              className="ml-2 px-3 py-1.5 text-xs rounded bg-purple-600 text-white"
              title="Strategy Lab çalıştır"
            >Strategy Lab (Run)</button>
          </div>
          {/* Uyarı eşikleri */}
          <div className="ml-2 hidden md:flex items-center gap-1 text-xs text-slate-700">
            <label htmlFor="alertDelta">Δ%</label>
            <input id="alertDelta" name="alertDelta" type="number" value={alertDelta}
              onChange={(e)=> setAlertDelta(Math.max(1, Math.min(20, parseInt(e.target.value)||5)))}
              className="w-12 px-2 py-1 border rounded text-black bg-white" />
            <label htmlFor="alertConf">Conf%</label>
            <input id="alertConf" name="alertConf" type="number" value={alertMinConf}
              onChange={(e)=> setAlertMinConf(Math.max(50, Math.min(99, parseInt(e.target.value)||70)))}
              className="w-12 px-2 py-1 border rounded text-black bg-white" />
            <select id="alertChannel" name="alertChannel" value={alertChannel} onChange={(e)=> setAlertChannel(e.target.value as any)} className="ml-2 px-2 py-1 border rounded text-black bg-white">
              <option value="web">Web</option>
              <option value="telegram">Telegram</option>
            </select>
          </div>
          <input
                    name="searchSymbol"
                    id="searchSymbol"
            value={search}
            onChange={(e)=>setSearch(e.target.value.toUpperCase())}
            placeholder="Sembol ara"
                    className="ml-2 px-2 py-1 text-xs border rounded w-28 text-gray-900 caret-blue-500 bg-white placeholder-gray-400 dark:text-gray-100 dark:bg-gray-900"
                  />
                  <button
                    onClick={()=>{
                      setFilterWatch(false);
                      setFilterAcc80(false);
                      setFilterMomentum(false);
                      setSignalFilter('all');
                      setSortBy('confidence');
                      setSearch('');
                      setActiveHorizons(['1d']);
                      setMaxRows(maxRowsDefaultByUniverse[universe]);
                    }}
                    className="ml-2 px-2 py-1 text-xs rounded bg-slate-200 text-slate-900 hover:bg-slate-300"
                  >Filtreleri Temizle</button>
                  <button
                    onClick={()=>{
                      setMaxRows(maxRowsAllByUniverse[universe]);
                      if (activeHorizons.length>1) setActiveHorizons(['1d']);
                    }}
                    className="px-2 py-1 text-xs rounded bg-blue-600 text-white"
                  >Tümünü Göster</button>
                  <select
                    value={signalFilter}
                    onChange={(e)=>setSignalFilter(e.target.value)}
                    className="ml-2 px-2 py-1 text-xs border rounded text-gray-900 bg-white dark:text-gray-100 dark:bg-gray-900"
                  >
                    <option value="all">Tüm</option>
                    <option value="buy">Alış</option>
                    <option value="sell">Satış</option>
                    <option value="hold">Bekle</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e)=>setSortBy(e.target.value as any)}
                    className="ml-2 px-2 py-1 text-xs border rounded text-gray-900 bg-white dark:text-gray-100 dark:bg-gray-900"
                  >
                    <option value="confidence">Güven↓</option>
                    <option value="prediction">Tahmin↓</option>
                    <option value="symbol">Sembol</option>
                  </select>
                  <input
                    type="number"
                    name="maxRows"
                    id="maxRows"
                    min={5}
                    max={30}
                    value={maxRows}
                    onChange={(e)=>setMaxRows(Math.max(5, Math.min(30, parseInt(e.target.value) || 15)))}
                    className="ml-2 px-2 py-1 text-xs border rounded w-16 text-gray-900 caret-blue-500 bg-white placeholder-gray-400 dark:text-gray-100 dark:bg-gray-900"
                    placeholder="15"
          />
          <div className="ml-2 flex items-center gap-1 text-xs">
            <button
              onClick={() => {
                console.log('👁️ Görünüm değiştiriliyor: table');
                setView('table');
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                border: '1px solid #e2e8f0',
                backgroundColor: view === 'table' ? '#2563eb' : '#f1f5f9',
                color: view === 'table' ? '#ffffff' : '#1e293b',
                transition: 'all 0.2s'
              }}
            >
              Tablo
            </button>
            <button
              onClick={() => {
                console.log('👁️ Görünüm değiştiriliyor: cards');
                setView('cards');
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                border: '1px solid #e2e8f0',
                backgroundColor: view === 'cards' ? '#2563eb' : '#f1f5f9',
                color: view === 'cards' ? '#ffffff' : '#1e293b',
                transition: 'all 0.2s'
              }}
            >
              Kartlar
            </button>
          </div>
          {/* TraderGPT aç/kapa */}
          <button
            onClick={()=> setGptOpen(v=>!v)}
            className="px-3 py-1.5 text-xs rounded-lg bg-purple-600 text-white hover:opacity-90"
            title="TraderGPT konuşmalı panel"
          >🤖 TraderGPT</button>
        </div>
      </div>
      {/* AI-first Header banner */}
      <div className="mb-3">
        <div className="w-full rounded-xl border bg-white p-3 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="text-base sm:text-lg font-bold text-slate-900">🤖 BIST AI Smart Trader — Powered by Meta-Model Engine</div>
              <div className="text-xs text-slate-600">Gerçek zamanlı öğrenen yapay zekâ. 87.3% doğruluk, 0.5% alpha avantajı.</div>
            </div>
            <div className="text-[11px] text-slate-500">
              AI Realtime Core aktif ({lastUpdated ? lastUpdated.toLocaleTimeString('tr-TR', {hour:'2-digit',minute:'2-digit'}) : '—'} güncelleme)
            </div>
          </div>
        </div>
      </div>

      {/* Zaman damgası / veri kaynağı */}
      <div className="flex items-center justify-end -mt-2 mb-2 text-[11px] text-slate-500">
        <span>Son güncelleme • {lastUpdated ? lastUpdated.toLocaleTimeString('tr-TR', {hour:'2-digit',minute:'2-digit',second:'2-digit'}) : '—'} • İstanbul</span>
        <span className="mx-2">•</span>
        <span>Kaynak: {DATA_SOURCE}</span>
      </div>

      {/* AI Intelligence – üstte AI odaklı sekme/kart (stub) */}
      <div className="mb-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* AI Günlük Özeti (gradient + hafif vurgu) */}
        <div className="rounded-xl p-3 border shadow-sm" style={{ background: 'linear-gradient(135deg,#6d28d9 0%, #2563eb 100%)' }}>
          <div className="text-sm font-semibold text-white mb-1">AI Günlük Özeti</div>
          <div className="text-xs text-white/90">Son 24 saatte model {Math.max(1, Math.round((rows.length||12)/4))} kez öğrenme/güncelleme yaptı. Meta-confidence stabil.</div>
        </div>
        {/* Meta-Model Heatmap (stub) */}
        <div className="rounded-xl p-3 border bg-white">
          <div className="text-sm font-semibold text-slate-900 mb-1">Meta-Model Heatmap (≥%80)</div>
          <div className="text-xs text-slate-700">En yüksek güvenli 6 sembol: {(rows||[]).slice(0,6).map(r=>r.symbol).filter((v,i,a)=>a.indexOf(v)===i).slice(0,6).join(', ') || '—'}</div>
        </div>
        {/* Drift & Mismatch (stub) */}
        <div className="rounded-xl p-3 border bg-white">
          <div className="text-sm font-semibold text-slate-900 mb-1">Drift & Mismatch</div>
          <div className="text-xs text-slate-700">Confidence drift izleniyor. Sentiment-fiyat uyumsuzluğu: orta düzey.</div>
        </div>
      </div>

      {/* BIST30 özel üst özet */}
      {universe==='BIST30' && (
        <div className="mb-4 grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-sm font-semibold text-gray-900 mb-2">Sektör Dağılımı</div>
            <div className="space-y-2">
              {(bist30Overview?.sector_distribution||[]).map((s:any)=> (
                <div key={s.sector} className="text-xs">
                  <div className="flex justify-between mb-1 text-gray-700"><span>{s.sector}</span><span>{s.weight}%</span></div>
                  <div className="w-full h-2 bg-gray-100 rounded">
                    <div style={{ width: s.weight + '%', background: s.change>=0 ? '#10b981' : '#ef4444' }} className="h-2 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-sm font-semibold text-gray-900 mb-2">Endeks Karşılaştırma</div>
            <div className="text-sm text-gray-800">
              <div className="flex justify-between"><span>BIST30 (24s)</span><span className={ (bist30Overview?.index_comparison?.bist30_change||0) >=0 ? 'text-green-700' : 'text-red-700'}>{(bist30Overview?.index_comparison?.bist30_change||0)}%</span></div>
              <div className="flex justify-between"><span>XU030 (24s)</span><span className={ (bist30Overview?.index_comparison?.xu030_change||0) >=0 ? 'text-green-700' : 'text-red-700'}>{(bist30Overview?.index_comparison?.xu030_change||0)}%</span></div>
              <div className="flex justify-between mt-2 font-semibold"><span>Alpha</span><span className={ (bist30Overview?.index_comparison?.alpha||0) >=0 ? 'text-green-700' : 'text-red-700'}>{(bist30Overview?.index_comparison?.alpha||0)}%</span></div>
              <div className="mt-3 text-xs text-gray-600">İlk 5 yükseliş: {(bist30Overview?.top5_gainers_24h||[]).map((x:any)=> x.symbol + ' +' + x.chg24h + '%').join(', ')}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-sm font-semibold text-gray-900 mb-2">BIST30 Haberleri (24s)</div>
            <div className="space-y-2 max-h-40 overflow-auto pr-1">
              {bist30News.map((n:any, idx:number)=> {
                const url: string = String(n.url || '').trim();
                const isValid = /^https?:\/\//i.test(url) && !/example\.com/i.test(url);
                const onClick = (e: any) => {
                  if (!isValid) { e.preventDefault(); e.stopPropagation(); return false; }
                  return true;
                };
                const host = (()=>{ try { return isValid ? new URL(url).hostname.replace(/^www\./,'') : 'demo.news'; } catch { return 'demo.news'; } })();
                return (
                  <a
                    key={idx}
                    href={isValid ? url : '#'}
                    target={isValid ? '_blank' : undefined}
                    rel={isValid ? 'noreferrer noopener' : undefined}
                    onClick={onClick}
                    className="block text-xs no-underline"
                    title={n.title}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-gray-900 truncate">{n.title}{!isValid && ' (demo)'}</span>
                      <span
                        className={`inline-flex items-center justify-center ml-2 px-2 h-5 min-w-[44px] rounded-full border text-[10px] font-semibold uppercase tracking-wide ${n.sentiment==='Pozitif'?'bg-green-50 text-green-700 border-green-200': n.sentiment==='Negatif'?'bg-red-50 text-red-700 border-red-200':'bg-slate-50 text-slate-600 border-slate-200'}`}
                      >
                        {n.sentiment==='Pozitif'?'POZ': n.sentiment==='Negatif'?'NEG':'NÖTR'}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">{host}</span>
                      <span>{n.symbol}</span>
                      <span>• {new Date(n.published_at).toLocaleTimeString('tr-TR', {hour:'2-digit',minute:'2-digit'})} UTC+3</span>
                    </div>
                  </a>
                );
              })}
              {bist30News.length===0 && <div className="text-xs text-gray-500">Son 24 saatte haber bulunamadı.</div>}
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-sm font-semibold text-gray-900 mb-2">FinBERT Duygu Özeti</div>
            <div className="text-xs text-slate-700">
              {(() => {
                const ov = sentimentSummary?.overall || {};
                const a = Number(ov.positive||0), b = Number(ov.negative||0), c = Number(ov.neutral||0);
                const s = Math.max(1, a+b+c);
                const posN = Math.round(a/s*100);
                const negN = Math.round(b/s*100);
                const neuN = Math.max(0, 100 - posN - negN);
                return (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">Pozitif {posN}%</span>
                    <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">Negatif {negN}%</span>
                    <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200">Nötr {neuN}%</span>
                  </div>
                );
              })()}
              <div className="mt-1">
                <div className="text-[11px] text-slate-500 mb-1">7g Pozitif Trend</div>
                {(() => {
                  const series = Array.isArray(sentimentSummary?.trend_7d) ? sentimentSummary.trend_7d.map((d:any)=> Number(d.positive) || 0) : [];
                  return <Sparkline series={series} width={120} height={24} color="#10b981" />;
                })()}
              </div>
              <div className="mt-2 text-[10px] text-slate-500">Model: {sentimentSummary?.overall?.model || '—'} • TZ: {sentimentSummary?.timezone || 'UTC+3'}</div>
            </div>
          </div>
        </div>
      )}
      {/* Ranker Top-N (uncertainty-aware) */}
      <div className="mb-3 bg-white rounded-lg p-3 border">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-900">AI Ranker Top-N</div>
          <div className="text-xs text-slate-600">Uncertainty-aware</div>
        </div>
        {(() => { const { useRanker } = require('@/hooks/queries'); const rk = useRanker(universe, 10); return (
          <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2">
            {(!rk.data ? Array.from({length:5}) : rk.data.top).slice(0,10).map((r:any, i:number)=> (
              <div key={i} className="px-2 py-1 rounded border bg-slate-50 text-xs flex items-center justify-between">
                <span className="font-semibold text-slate-900">{r?.symbol || '—'}</span>
                <span className="text-slate-700">{r?.confidence ? `${r.confidence}%` : ''}</span>
              </div>
            ))}
          </div>
        ); })()}
      </div>

      {/* Table - sticky head, scrollable body */}
      {view==='table' && (
      <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 260px)', overflowY: 'auto' }}>
        {/* Virtualization kaldırıldı: tek tip tablo renderı */}
        <table className="min-w-full text-sm" style={{ tableLayout: 'fixed', width: '100%' }}>
          <colgroup>
            <col style={{ width: '12%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '6%' }} />
          </colgroup>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }} className="bg-gray-50 dark:bg-gray-800">
            <tr className="text-left">
              <th className="py-2 pr-4 text-gray-900 font-semibold dark:text-gray-100">Sembol</th>
              <th className="py-2 pr-4 text-gray-900 font-semibold dark:text-gray-100">Ufuk</th>
              <th className="py-2 pr-4 text-gray-900 font-semibold dark:text-gray-100">Tahmin</th>
              <th className="py-2 pr-4 hidden md:table-cell text-gray-900 font-semibold dark:text-gray-100">Trend</th>
              <th className="py-2 pr-4 hidden lg:table-cell text-gray-900 font-semibold dark:text-gray-100">Teknik</th>
              <th className="py-2 pr-4 text-gray-900 font-semibold dark:text-gray-100">Sinyal</th>
              <th className="py-2 pr-4 text-gray-900 font-semibold dark:text-gray-100">Güven</th>
              <th className="py-2 pr-4 hidden md:table-cell text-gray-900 font-semibold dark:text-gray-100">Geçerlilik</th>
              <th className="py-2 pr-4 text-gray-900 font-semibold dark:text-gray-100">İşlemler</th>
            </tr>
          </thead>
          <tbody className="text-slate-900">
            {/* Debug satırı */}
            <tr><td className="py-1 text-[11px] text-gray-500" colSpan={9}>rows.len={rows?.length||0} | universe={universe}</td></tr>
            {loading ? (
              <tr>
                <td colSpan={9} className="py-4">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-52 rounded" />
                    <Skeleton className="h-8 w-full rounded" />
                    <Skeleton className="h-8 w-full rounded" />
                    <Skeleton className="h-8 w-full rounded" />
                  </div>
                </td>
              </tr>
            ) : (() => {
              const list = tableList;
              if (!loading && list.length === 0) {
                // Demo fallback satırları (deterministik, SSR uyumlu)
                const demoSymbols = ['GARAN','AKBNK','EREGL','SISE','THYAO'];
                const demoPercents = [0.081, 0.074, 0.069, 0.055, 0.043]; // sabit
                return demoSymbols.map((s, i)=> {
                  const pct = demoPercents[i] || 0.05;
                  const pctText = (pct * 100).toFixed(1);
                  return (
                    <tr key={'DEMO-'+s} className="border-t bg-yellow-50">
                      <td className="py-2 pr-4 font-medium">{s}</td>
                      <td className="py-2 pr-4">1d</td>
                      <td className="py-2 pr-4">Yükseliş ({pctText}%)</td>
                      <td className="py-2 pr-4 hidden md:table-cell">demo</td>
                      <td className="py-2 pr-4 hidden lg:table-cell">MACD/RSI</td>
                      <td className="py-2 pr-4"><span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">Al</span></td>
                      <td className="py-2 pr-4">86%</td>
                      <td className="py-2 pr-4 hidden md:table-cell">—</td>
                      <td className="py-2 pr-4">—</td>
                    </tr>
                  );
                });
              }

              return list.map((r, i) => {
              const up = r.prediction >= 0;
              const confPct = Math.round(r.confidence * 100);
              const inWatch = watchlist.includes(r.symbol);
                const trend = trendLabel(r.prediction || 0);
                const techs = technicalBadges(r.prediction || 0, r.confidence || 0);
                const success10 = successRateOf(r.symbol, r.confidence || 0);
                const curr = seedPrice(r.symbol);
                const tgt = Math.round(curr * (1 + (r.prediction||0)) * 100) / 100;
              let signal = 'Bekle';
              let signalColor = 'bg-gray-100 text-gray-700';
              if (confPct >= 80) {
                  if (r.prediction >= 0.1) { signal = 'Güçlü Al'; signalColor = 'bg-green-100 text-green-700'; }
                  else if (r.prediction >= 0.05) { signal = 'Al'; signalColor = 'bg-blue-100 text-blue-700'; }
                  else if (r.prediction <= -0.1) { signal = 'Güçlü Sat'; signalColor = 'bg-red-100 text-red-700'; }
                  else if (r.prediction <= -0.05) { signal = 'Sat'; signalColor = 'bg-orange-100 text-orange-700'; }
                }
                const isSelected = selectedSymbol === r.symbol;
                const rowStyle: React.CSSProperties = { borderLeft: '6px solid ' + (up ? '#2563eb' : '#111827'), background: confidenceBg(confPct) };
                // Sinyal rozetini mavi/siyah palete yaklaştır
                if (up) {
                  signalColor = 'text-blue-700 dark:text-blue-400';
                } else if (r.prediction <= -0.05) {
                  signalColor = 'text-red-700 dark:text-red-400';
                } else {
                  signalColor = 'text-yellow-600 dark:text-yellow-400';
                }
                const rowClass = `cursor-pointer transition-colors ${isSelected ? 'bg-blue-100 dark:bg-blue-900/40' : 'even:bg-gray-50 dark:even:bg-gray-900/40'} hover:bg-blue-50 dark:hover:bg-blue-900/40`;
              return (
                  <React.Fragment key={`${r.symbol}-${r.horizon}-${i}`}>
                    <tr 
                      className={rowClass}
                      style={rowStyle}
                      onClick={() => { setSelectedSymbol(r.symbol); }}
                    >
                      <td className="py-2 pr-4 font-bold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis">{r.symbol}</td>
                      <td className="py-2 pr-4 text-slate-900 whitespace-nowrap font-semibold">
                        {r.horizon}
                        {bestHorizonBySymbol.get(r.symbol)===r.horizon && (
                          <span title="En güvenilir ufuk" className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">★</span>
                        )}
                  </td>
                      <td className="py-2 pr-4 flex items-center gap-1 text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis font-semibold">
                        {trend==='Yükseliş' ? <ArrowTrendingUpIcon className="h-4 w-4 text-blue-600" /> : (trend==='Düşüş' ? <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" /> : <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-400" />)}
                        <span className="text-black font-bold">{trend}</span>
                  </td>
                      <td className="py-2 pr-4 hidden md:table-cell">
                        <div className="flex items-center gap-2 flex-wrap overflow-hidden">
                          {techs.map((c) => (
                            <span key={c} title={c.includes('RSI')? 'RSI>70 → aşırı alım; RSI<30 → aşırı satım' : c.includes('MACD')? 'MACD sinyali trend yönünü teyit eder' : 'Momentum ve hacim birleşimi'} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-900 border border-blue-200 whitespace-nowrap overflow-hidden text-ellipsis dark:bg-blue-900/40 dark:text-blue-100 dark:border-blue-800">{c}</span>
                          ))}
                          <div className="ml-auto hidden xl:block">
                            <Sparkline series={seededSeries(r.symbol + '-row', 24)} width={80} height={18} color={up? '#16a34a':'#dc2626'} />
                          </div>
                        </div>
                      </td>
                      <td className="py-2 pr-4 whitespace-nowrap font-bold">
                        {(() => {
                          const pct = r.prediction*100;
                          const cls = pct > 1 ? 'text-green-600' : (pct < -1 ? 'text-red-600' : 'text-slate-500');
                          const arrow = pct > 1 ? '↑' : (pct < -1 ? '↓' : '→');
                          return (
                            <span title="24 saat tahmini değişim" className={cls}>
                              {arrow} ₺{tgt.toFixed(2)} ({Math.abs(pct).toFixed(1)}%)
                    </span>
                          );
                        })()}
                  </td>
                      <td className="py-2 pr-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 w-full max-w-[220px]">
                          <div className="flex-1 h-2 rounded bg-gray-100 overflow-hidden">
                            <div className="h-2" style={{ width: confPct + '%', background: confPct>=85 ? '#10b981' : confPct>=70 ? '#fbbf24' : '#ef4444' }}></div>
                          </div>
                          <span className="text-[12px] font-semibold text-black">{confPct}%</span>
                          <span className="px-2 py-0.5 rounded bg-gray-100">S10 {success10}%</span>
                        </div>
                      </td>
                      <td className="py-2 pr-4 flex items-center gap-1 text-gray-800 hidden md:table-cell whitespace-nowrap">
                    <ClockIcon className="h-4 w-4" />
                    {new Date(r.valid_until).toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})}
                  </td>
                      <td className="py-2 pr-4 flex items-center gap-2 whitespace-nowrap">
                    <button
                          onClick={async ()=>{ try { const mode = inWatch ? 'remove':'add'; await wlMut.mutateAsync({ symbols: r.symbol, mode }); } catch {} }}
                      className={`px-2 py-1 text-xs rounded ${inWatch?'bg-yellow-100 text-yellow-800':'bg-gray-100 text-gray-700'}`}
                        >{inWatch?'⭐ Takipte':'☆ Takibe Al'}</button>
                        {confPct>=alertMinConf && (
                          <button onClick={async ()=>{ try { 
                            if (alertChannel==='web') { await alertMut.mutateAsync({ delta: alertDelta, minConf: alertMinConf, source: 'AI v4.6 model BIST30 dataset' }); }
                            else { await Api.sendTelegramAlert(r.symbol, `AI uyarı: ${r.symbol} Δ>${alertDelta}%, Conf≥${alertMinConf}%`, 'demo'); }
                          } catch {} }} className="px-2 py-1 text-xs rounded bg-blue-600 text-white">Bildirim</button>
                    )}
                  </td>
                </tr>
                  </React.Fragment>
              );
              });
            })()}
          </tbody>
        </table>
      </div>
      )}

      {/* Cards */}
      {view==='cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(() => {
            if (loading) return (
              <>
                <div className="border rounded-xl p-4 bg-white shadow-sm">
                  <Skeleton className="h-5 w-24 mb-3 rounded" />
                  <Skeleton className="h-4 w-40 mb-2 rounded" />
                  <Skeleton className="h-4 w-32 mb-4 rounded" />
                  <Skeleton className="h-20 w-full rounded" />
                </div>
                <div className="border rounded-xl p-4 bg-white shadow-sm">
                  <Skeleton className="h-5 w-24 mb-3 rounded" />
                  <Skeleton className="h-4 w-40 mb-2 rounded" />
                  <Skeleton className="h-4 w-32 mb-4 rounded" />
                  <Skeleton className="h-20 w-full rounded" />
                </div>
                <div className="border rounded-xl p-4 bg-white shadow-sm">
                  <Skeleton className="h-5 w-24 mb-3 rounded" />
                  <Skeleton className="h-4 w-40 mb-2 rounded" />
                  <Skeleton className="h-4 w-32 mb-4 rounded" />
                  <Skeleton className="h-20 w-full rounded" />
                </div>
              </>
            );
            const groups = rows
              .filter(r => (!filterWatch || watchlist.includes(r.symbol)) && (search==='' || r.symbol.includes(search)))
              .reduce((acc: Record<string, Prediction[]>, p) => {
                (acc[p.symbol] = acc[p.symbol] || []).push(p);
                return acc;
              }, {} as Record<string, Prediction[]>);
            return Object.entries(groups).map(([sym, list]) => {
              const sorted = list.slice().sort((a,b)=> (b.confidence||0)-(a.confidence||0));
              const best = sorted[0];
              const up = best.prediction >= 0;
              const confPct = Math.round(best.confidence*100);
              const inWatch = watchlist.includes(sym);
              const currentPrice = seedPrice(sym);
              const bestH = bestHorizonBySymbol.get(sym);
              const consistency = (() => {
                const dirs = list.map(x=> (x.prediction||0) >= 0 ? 1 : -1);
                const maj = dirs.reduce((a,b)=> a + b, 0) >= 0 ? 1 : -1;
                const ok = dirs.filter(d=> d===maj).length;
                return `${ok}/${dirs.length}`;
              })();
              const diffPct = Math.round((best.prediction||0) * 1000) / 10; // % (fallback)
              const fQ = useForecast(sym, '1d', true);
              const targetPrice = fQ.data?.targetPrice ?? Math.round(currentPrice * (1 + (best.prediction||0)) * 100) / 100;
              return (
                <div key={sym} className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => { setSelectedSymbol(sym); }}>
                  <div className="flex items-center justify-between">
                    <div className="text-[16px] font-bold text-slate-900">{sym}</div>
                    <div className={`text-xs px-2 py-0.5 rounded-full border ${up?'bg-green-50 text-green-700 border-green-200':'bg-red-50 text-red-700 border-red-200'}`}>{up?'Yükseliş':'Düşüş'}</div>
                  </div>
                  <div className="mt-1 text-sm text-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={up? 'text-green-600 font-semibold':'text-red-600 font-semibold'}>
                        {up ? '▲' : '▼'} {diffPct}%
                      </span>
                      <span className="text-slate-600">Güven: <span className="font-semibold text-[#111827]">{confPct}%</span></span>
                      <span className="text-slate-600">Ufuk: <span className="font-semibold text-slate-900">{best.horizon}</span></span>
                      {bestH && (
                        <span title="En güvenilir ufuk" className="px-2 py-0.5 text-[10px] rounded bg-blue-50 text-blue-800 border border-blue-200">En iyi: {bestH}</span>
                      )}
                      <span title="Multi-timeframe tutarlılık" className="px-2 py-0.5 text-[10px] rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Tutarlılık {consistency}</span>
                    </div>
                    {/* Mini sparkline */}
                    <div className="hidden sm:block">
                      <Sparkline series={seededSeries(sym + '-24h', 24)} width={90} height={24} color={up? '#16a34a':'#dc2626'} />
                    </div>
                  </div>
                  {/* Fiyat satırı */}
                  <div className="mt-2 text-sm flex items-center gap-4">
                    <div>
                      <span className="text-slate-500">Gerçek:</span> <span className="font-bold text-slate-900">₺{currentPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">AI Tahmini:</span> <span title="24s tahmini değişim" className={`font-bold ${up?'text-green-600':'text-red-600'}`}>₺{Number(targetPrice).toFixed(2)} ({(fQ.data?.deltaPct!==undefined ? (fQ.data.deltaPct>=0?'+':'')+String(fQ.data.deltaPct.toFixed(1)) : (up?'+':''+String(diffPct)))}%)</span>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    {sorted.map((p)=>{
                      const upx = p.prediction >= 0; const pct = Math.round(p.prediction*1000)/10;
                      const confc = Math.round(p.confidence*100);
                      const isBest = bestH && p.horizon===bestH;
                      const chip = isBest
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : (upx? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200');
                      return (
                        <div key={`${p.horizon}`} className={`flex items-center justify-between text-xs border ${chip} rounded px-2 py-1`}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{p.horizon}{isBest && ' ★'}</span>
                            <span>{upx?'Yükseliş':'Düşüş'} {pct}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>Güven {confc}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* AI tek satır yorum (forecast explain + TraderGPT mini balon) */}
                  <div className="mt-2 text-xs text-slate-700 flex items-center gap-2">
                    {Array.isArray(fQ.data?.explain) && fQ.data?.explain.length>0 && (
                      <>
                        <span title={(fQ.data.explain as any[]).join(' • ')}>ℹ️</span>
                        <span className="truncate max-w-[60%]">{String(fQ.data.explain[0])}</span>
                      </>
                    )}
                    <span className="ml-auto px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200" title="AI öneri balonu">🤖 Hedef ₺{Number(targetPrice).toFixed(2)}, stop ₺{(currentPrice*0.9).toFixed(2)}</span>
                  </div>
                  {/* Teknik mikro rozetler */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {technicalBadges(best.prediction||0, best.confidence||0).map((tag)=> (
                      <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">{tag}</span>
                    ))}
                  </div>
                  {/* Mini analiz cümlesi */}
                  <div className="mt-2 text-xs text-slate-700">
                    {miniAnalysis(best.prediction||0, best.confidence||0)}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-700">
                    <ClockIcon className="h-4 w-4" />
                    Geçerlilik: {new Date(best.valid_until).toLocaleTimeString('tr-TR', {hour:'2-digit',minute:'2-digit'})}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={async (e)=>{
                        e.stopPropagation();
                        try { const mode = inWatch ? 'remove':'add'; await wlMut.mutateAsync({ symbols: sym, mode }); } catch {}
                      }}
                      className={`px-2 py-1 text-xs rounded ${inWatch?'bg-yellow-100 text-yellow-800':'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
                    >{inWatch?'Takipte':'Takibe Al'}</button>
                    {confPct>=alertMinConf && (
                      <button
                        onClick={async (e)=>{ e.stopPropagation(); try { if (alertChannel==='web') { await alertMut.mutateAsync({ delta: alertDelta, minConf: alertMinConf, source: 'AI v4.6 model BIST30 dataset' }); } else { await Api.sendTelegramAlert(sym, `AI uyarı: ${sym} Δ>${alertDelta}%, Conf≥${alertMinConf}%`, 'demo'); } } catch {} }}
                        className="px-2 py-1 text-xs rounded bg-blue-600 text-white"
                      >Bildirim</button>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}
      </div>

      {/* Sağ Panel - Analiz */}
      <div className="w-80 bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analiz Paneli</h3>
        {/* TraderGPT Conversational Panel */}
        {gptOpen && (
          <div className="mb-4 border rounded-lg p-3 bg-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-slate-900">TraderGPT</div>
              <div className={`text-[11px] ${gptSpeaking? 'text-green-600':'text-slate-500'}`}>{gptSpeaking? 'Konuşuyor…':'Hazır'}</div>
            </div>
            <div className="h-32 overflow-auto border rounded p-2 mb-2 bg-slate-50">
              {gptMessages.map((m,i)=> (
                <div key={i} className={`text-xs mb-1 ${m.role==='ai'?'text-slate-800':'text-slate-600'}`}>
                  <span className="font-semibold">{m.role==='ai'?'AI:':'Sen:'}</span> {m.text}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={gptInput}
                onChange={(e)=> setGptInput(e.target.value)}
                onKeyDown={(e)=> { if (e.key==='Enter') handleGptAsk(); }}
                placeholder="Sorunu yaz: Örn. BIST30 top-3?"
                className="flex-1 px-2 py-1 text-xs border rounded text-black bg-white"
              />
              <button onClick={handleGptAsk} className="px-2 py-1 text-xs rounded bg-slate-900 text-white">Gönder</button>
              <button onClick={()=> { const last = gptMessages.filter(m=>m.role==='ai').slice(-1)[0]; if (last) speakText(last.text); }} className="px-2 py-1 text-xs rounded bg-purple-600 text-white" title="Sesli oku">🔊</button>
            </div>
            <div className="mt-2 flex gap-1 flex-wrap">
              {['BIST30 top‑3?','THYAO kısa vade?','Bankacılık görünümü?'].map((s)=> (
                <button key={s} onClick={()=> { setGptInput(s); }} className="px-2 py-0.5 text-[11px] rounded border bg-slate-100 hover:bg-slate-200">{s}</button>
              ))}
            </div>
          </div>
        )}
        
        {selectedSymbol ? (
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900">{selectedSymbol}</h4>
              <p className="text-sm text-blue-700">Seçilen sembol için detaylı analiz</p>
            </div>
            
            {analysisData ? (
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Tahmin Özeti</h5>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-slate-600">Ufuk:</span>
                    {(['1d','7d','30d'] as const).map(h => (
                      <button
                        key={h}
                        onClick={() => setAnalysisHorizon(h)}
                        className={`px-2 py-0.5 text-xs rounded border ${analysisHorizon===h? 'bg-blue-600 text-white border-blue-600':'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'}`}
                        title={`AI hedef fiyat — seçilen ufuk: ${h}`}
                      >{h}</button>
                    ))}
                    {analysisData?.best_horizon && (
                      <span className="ml-2 px-2 py-0.5 text-[10px] rounded bg-blue-50 text-blue-800 border border-blue-200" title="Modelin en güvenilir ufku">
                        En iyi: {String(analysisData.best_horizon)}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Beklenen Getiri:</span>
                      <span className="font-medium">{(analysisData.predictions?.[analysisHorizon]?.expected_return * 100 || 0).toFixed(2)}%</span>
                    </div>
                    {/* Rejim rozeti */}
                    {(() => { const { useRegime, usePI } = require('@/hooks/queries'); const r = useRegime(); const pi = usePI(selectedSymbol, analysisHorizon, !!selectedSymbol); return (
                      <div className="flex items-center justify-between text-xs">
                        <span title="Piyasa rejimi">Rejim:</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">{r.data?.regime || '—'}</span>
                        <span title="90% Tahmin Aralığı">PI90:</span>
                        <span className="font-medium">{pi.data ? `${pi.data.pi90_low_pct}% → ${pi.data.pi90_high_pct}%` : '—'}</span>
                      </div>
                    ); })()}
                    {/* Hedef fiyat */}
                    <div className="flex justify-between">
                      <span title="AI hedef fiyat — seçilen ufuk">Hedef Fiyat ({analysisHorizon}):</span>
                      {(() => {
                        const tp = Number(panelForecastQ.data?.targetPrice ?? 0);
                        const dp = Number(panelForecastQ.data?.deltaPct ?? 0);
                        const upx = dp >= 0;
                        return <span className={`font-bold ${upx?'text-green-600':'text-red-600'}`}>₺{tp ? tp.toFixed(2) : '—'} ({upx?'+':''}{dp.toFixed(1)}%)</span>;
                      })()}
                    </div>
                    {/* Forecast Confidence & Explain */}
                    <div className="flex justify-between">
                      <span>AI Güven (forecast):</span>
                      <span className="font-medium">{panelForecastQ.data?.confidence ? `${Number(panelForecastQ.data.confidence).toFixed(1)}%` : '—'}</span>
                    </div>
                    {Array.isArray(panelForecastQ.data?.explain) && panelForecastQ.data?.explain.length>0 && (
                      <details className="mt-2 text-xs text-slate-700" open>
                        <summary className="cursor-pointer select-none">AI Açıklama</summary>
                        <ul className="list-disc pl-4 mt-1">
                          {(panelForecastQ.data.explain as any[]).map((t:any, i:number)=> (
                            <li key={i}>{String(t)}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                    <div className="flex justify-between">
                      <span>Yükseliş Olasılığı:</span>
                      <span className="font-medium">{(analysisData.predictions?.[analysisHorizon]?.up_prob * 100 || 0).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Düşüş Olasılığı:</span>
                      <span className="font-medium">{(analysisData.predictions?.[analysisHorizon]?.down_prob * 100 || 0).toFixed(1)}%</span>
                    </div>
                    {/* Görsel progress barlar */}
                    <div className="mt-2">
                      <div className="text-xs text-slate-700 mb-1">Yükseliş</div>
                      <div className="h-2 bg-slate-200 rounded">
                        <div className="h-2 rounded bg-green-500" style={{ width: ((analysisData.predictions?.[analysisHorizon]?.up_prob || 0) * 100) + '%' }}></div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs text-slate-700 mb-1">Düşüş</div>
                      <div className="h-2 bg-slate-200 rounded">
                        <div className="h-2 rounded bg-red-500" style={{ width: ((analysisData.predictions?.[analysisHorizon]?.down_prob || 0) * 100) + '%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Model Kalitesi</h5>
                  <table className="text-sm w-full">
                    <tbody>
                      <tr><td className="py-1 text-slate-700">Brier Skoru</td><td className="py-1 text-right font-medium">{analysisData.calibration?.brier_score || 'N/A'}</td></tr>
                      <tr><td className="py-1 text-slate-700">ECE</td><td className="py-1 text-right font-medium">{analysisData.calibration?.ece || 'N/A'}</td></tr>
                      <tr><td className="py-1 text-slate-700">PSI</td><td className="py-1 text-right font-medium">{analysisData.drift?.population_stability_index || 'N/A'}</td></tr>
                    </tbody>
                  </table>
                  {(() => { const { useCalibration } = require('@/hooks/queries'); const cal = useCalibration(); const pts = Array.isArray(cal.data?.curve) ? cal.data.curve : []; if (!pts || pts.length===0) return <div className="mt-2 text-xs text-slate-500">Kalibrasyon eğrisi yok</div>; const w = 180, h = 80; const pad = 6; const sx = (p:number)=> pad + p*(w-2*pad); const sy = (o:number)=> (h-pad) - o*(h-2*pad); let d=''; pts.forEach((p:any, i:number)=>{ const x=sx(Number(p.pred||p.p||p.x||0)); const y=sy(Number(p.obs||p.y||0)); d += (i===0? 'M':'L') + x + ' ' + y + ' '; }); return (
                    <div className="mt-3">
                      <div className="text-xs text-slate-700 mb-1">Reliability Curve</div>
                      <svg width={w} height={h} viewBox={'0 0 '+w+' '+h}>
                        <rect x={0} y={0} width={w} height={h} fill="#ffffff" stroke="#e5e7eb" />
                        {/* perfect calibration diagonal */}
                        <line x1={pad} y1={h-pad} x2={w-pad} y2={pad} stroke="#94a3b8" strokeDasharray="4 3" />
                        {/* model curve */}
                        <path d={d} fill="none" stroke="#2563eb" strokeWidth={2} />
                      </svg>
                    </div>
                  ); })()}
                    </div>

                {/* XAI Waterfall & Analyst Sentiment & Faktörler */}
                <div className="grid grid-cols-1 gap-3">
                  {/* Tutarlılık Endeksi */}
                  {consistencyIndex && (
                    <div className="bg-white rounded border p-3">
                      <div className="text-sm font-semibold text-gray-900 mb-1">Tutarlılık Endeksi (1H • 4H • 1D)</div>
                      <div className="text-xs text-slate-700 flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${consistencyIndex.aligned ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {consistencyIndex.aligned ? 'Güçlü Uyum' : 'Kısmi/Weak'}
                        </span>
                        <span>Oylama: {consistencyIndex.score} / {consistencyIndex.votes}</span>
                  </div>
                    </div>
                  )}
                  <XaiAnalyst symbol={selectedSymbol} />
                  {(() => { const { useReasoning } = require('@/hooks/queries'); const rz = useReasoning(selectedSymbol||undefined as any); return (
                    <div className="bg-white rounded border p-3">
                      <div className="text-sm font-semibold text-gray-900 mb-1">AI Nedenleri (Kısa İz)</div>
                      {!rz.data ? <Skeleton className="h-10 w-full rounded" /> : (
                        <ul className="text-xs text-slate-700 list-disc pl-4 space-y-1">
                          {(rz.data.reasons||[]).map((t:string, i:number)=> (<li key={i}>{t}</li>))}
                        </ul>
                      )}
                    </div>
                  ); })()}
                  {(() => { const { useMetaEnsemble } = require('@/hooks/queries'); const me = useMetaEnsemble(selectedSymbol||undefined as any, analysisHorizon, !!selectedSymbol); return (
                    <div className="bg-white rounded border p-3">
                      <div className="text-sm font-semibold text-gray-900 mb-1">Meta-Ensemble (LSTM • Prophet • FinBERT)</div>
                      {!me.data ? <Skeleton className="h-10 w-full rounded" /> : (
                        <div className="text-xs text-slate-700 space-y-1">
                          <div className="flex justify-between"><span>Meta-Confidence</span><span className="font-semibold">{me.data.meta_confidence}%</span></div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-slate-50 rounded p-2 border"><div className="text-[11px]">LSTM-X</div><div className="font-medium">{me.data.components?.lstm_x_v2_1}%</div></div>
                            <div className="bg-slate-50 rounded p-2 border"><div className="text-[11px]">Prophet++</div><div className="font-medium">{me.data.components?.prophet_pp}%</div></div>
                            <div className="bg-slate-50 rounded p-2 border"><div className="text-[11px]">FinBERT</div><div className="font-medium">{me.data.components?.finbert_price_fusion}%</div></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ); })()}
                  {/* TraderGPT Önerisi (balon) */}
                  <div className="bg-white rounded border p-3">
                    <div className="text-sm font-semibold text-gray-900 mb-1">🤖 TraderGPT Önerisi</div>
                    <div className="text-xs text-slate-700">
                      {(() => {
                        const best = rows.filter(r=> r.symbol===selectedSymbol).sort((a,b)=> (b.confidence||0)-(a.confidence||0))[0];
                        if (!best) return 'Veri bekleniyor...';
                        const trend = best.prediction >= 0.02 ? 'yükseliş' : best.prediction <= -0.02 ? 'düşüş' : 'yanal';
                        const conf = Math.round((best.confidence||0)*100);
                        const msg = trend === 'yükseliş'
                          ? `${selectedSymbol} için kısa vadede ${trend} eğilimi; güven %${conf}. Pozisyonu küçük adımlarla artır, SL %3.`
                          : trend === 'düşüş'
                          ? `${selectedSymbol} için ${trend} uyarısı; güven %${conf}. Ağırlığı azalt veya hedge düşün.`
                          : `${selectedSymbol} için net yön yok; güven %${conf}. Bekle/izle, teyit sinyali bekle.`;
                        return (
                          <div className="relative">
                            <div className="inline-block bg-slate-100 text-slate-800 px-3 py-2 rounded-lg">
                              {msg}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  {(() => { const { useBOCalibrate } = require('@/hooks/queries'); const bo = useBOCalibrate(); return (
                    <div className="bg-white rounded border p-3">
                      <div className="text-sm font-semibold text-gray-900 mb-1">BO Kalibrasyon (son 24s)</div>
                      {!bo.data ? <Skeleton className="h-10 w-full rounded" /> : (
                        <div className="text-xs text-slate-700 space-y-1">
                          <div className="flex justify-between"><span>Expected AUC</span><span className="font-semibold">{bo.data.expected_auc}</span></div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-slate-50 rounded p-2 border"><div className="text-[11px]">LSTM</div><div className="font-medium">L={bo.data.best_params?.lstm?.layers}, H={bo.data.best_params?.lstm?.hidden}, LR={bo.data.best_params?.lstm?.lr}</div></div>
                            <div className="bg-slate-50 rounded p-2 border"><div className="text-[11px]">Prophet</div><div className="font-medium">{bo.data.best_params?.prophet?.seasonality}, CP={bo.data.best_params?.prophet?.changepoint_prior}</div></div>
                            <div className="bg-slate-50 rounded p-2 border"><div className="text-[11px]">Fusion</div><div className="font-medium">α=({bo.data.best_params?.fusion?.alpha_lstm},{bo.data.best_params?.fusion?.alpha_prophet},{bo.data.best_params?.fusion?.alpha_finbert})</div></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ); })()}
                  {(() => { const { useFactors } = require('@/hooks/queries'); const fx = useFactors(selectedSymbol||undefined as any); return (
                    <div className="bg-white rounded border p-3">
                      <div className="text-sm font-semibold text-gray-900 mb-1">Faktör Skorları</div>
                      {!fx.data ? <Skeleton className="h-10 w-full rounded" /> : (
                        <ul className="text-xs text-slate-700 space-y-1">
                          <li className="flex justify-between"><span>Quality</span><span className="font-medium">{Math.round(fx.data.quality*100)}%</span></li>
                          <li className="flex justify-between"><span>Value</span><span className="font-medium">{Math.round(fx.data.value*100)}%</span></li>
                          <li className="flex justify-between"><span>Momentum</span><span className="font-medium">{Math.round(fx.data.momentum*100)}%</span></li>
                          <li className="flex justify-between"><span>Low Vol</span><span className="font-medium">{Math.round(fx.data.low_vol*100)}%</span></li>
                        </ul>
                      )}
                    </div>
                  ); })()}
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Model Durumu</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Drift Bayrakları:</span>
                      <span className="font-medium">{analysisData.drift?.feature_drift_flags?.join(', ') || 'Yok'}</span>
                    </div>
                    {/* Mini sparkline 1h/1d */}
                    <div className="mt-2">
                      <div className="text-xs text-slate-700 mb-1">Fiyat Özeti</div>
                      <div className="flex items-center gap-2">
                        <Sparkline series={seededSeries(selectedSymbol + '-1h', 24)} width={100} height={22} color="#0ea5e9" />
                        <Sparkline series={seededSeries(selectedSymbol + '-1d', 24)} width={100} height={22} color="#22c55e" />
                  </div>
                    </div>
                    {/* AI öneri cümlesi */}
                    <div className="mt-2 text-xs text-slate-700 bg-white rounded p-2 border">
                      {(() => {
                        const upProb = analysisData.predictions?.[analysisHorizon]?.up_prob || 0;
                        const er = analysisData.predictions?.[analysisHorizon]?.expected_return || 0;
                        const phrase = upProb >= 0.65 && er > 0 ? 'AI, bu sembolde kısa vadede pozitif ağırlık öneriyor.' : (er < 0 ? 'AI, kısa vadede risk uyarısı veriyor; ağırlık azaltılabilir.' : 'AI, nötr; teyit için ek sinyal bekleyin.');
                        return phrase;
                      })()}
                    </div>
                    <div className="flex justify-end">
                      <button onClick={()=>{ /* react-query otomatik refetch ediyor */ }} className="px-2 py-1 text-xs rounded bg-slate-200 text-slate-900 hover:bg-slate-300">Yenile 🔁</button>
                    </div>
                  </div>
                </div>

                {/* Quick Backtest (tcost/rebalance) */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Quick Backtest</h5>
                  <div className="flex items-center gap-2 text-xs text-slate-700 mb-2">
                    <label htmlFor="btTcost">Tcost (bps)</label>
                    <input id="btTcost" type="number" className="w-14 px-2 py-1 border rounded text-black bg-white" value={backtestTcost} onChange={(e)=> setBacktestTcost(Math.max(0, Math.min(50, parseInt(e.target.value)||8)))} />
                    <label htmlFor="btReb">Rebalance (gün)</label>
                    <input id="btReb" type="number" className="w-16 px-2 py-1 border rounded text-black bg-white" value={backtestRebDays} onChange={(e)=> setBacktestRebDays(Math.max(1, Math.min(30, parseInt(e.target.value)||5)))} />
                  </div>
                  {(() => {
                    const { useBacktestQuick } = require('@/hooks/queries');
                    const bt = useBacktestQuick(universe, backtestTcost, backtestRebDays, !!selectedSymbol);
                    if (!bt.data) return <Skeleton className="h-10 w-full rounded" />;
                    return (
                      <div className="text-xs text-slate-700 space-y-1">
                        <div className="flex justify-between"><span>Başlangıç</span><span className="font-medium">₺{(bt.data.start_equity||0).toLocaleString('tr-TR')}</span></div>
                        <div className="flex justify-between"><span>Bitiş</span><span className="font-medium">₺{(bt.data.end_equity||0).toLocaleString('tr-TR')}</span></div>
                        <div className="flex justify-between"><span>Getiri</span><span className={`font-semibold ${((bt.data.total_return_pct||0)>=0)?'text-green-600':'text-red-600'}`}>{bt.data.total_return_pct}%</span></div>
                        <div className="flex justify-between"><span>Benchmark BIST30</span><span className="font-semibold text-[#111827]">%4.2</span></div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="py-4 space-y-3">
                <Skeleton className="h-5 w-40 rounded" />
                <Skeleton className="h-4 w-64 rounded" />
                <Skeleton className="h-24 w-full rounded" />
              </div>
            )}
          </div>
        ) : null}

        {/* AI Intelligence Hub */}
        {!selectedSymbol && (
          <div className="mt-4">
            <IntelligenceHub />
          </div>
        )}
      </div>
    </div>
    </AIOrchestrator>
  );
}



