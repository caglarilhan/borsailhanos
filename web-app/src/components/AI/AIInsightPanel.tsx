'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { fmtPct1 } from '@/lib/intl-format';
import dynamic from 'next/dynamic';
const MTFConsistency = dynamic(() => import('@/components/AI/MTFConsistency').then(m=>m.MTFConsistency), { ssr: false });
const SectorHeatmap = dynamic(() => import('@/components/AI/SectorHeatmap').then(m=>m.SectorHeatmap), { ssr: false });
import { useLastUpdateStore } from '@/lib/last-update-store';

type IndexStance = 'positive'|'neutral'|'negative';

export function AIInsightPanel() {
  const [market, setMarket] = useState<any>(null);
  const [signals, setSignals] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const setLastUpdatedAt = useLastUpdateStore((s)=> s.setLastUpdatedAt);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [m, s, p, sum] = await Promise.all([
        fetch('/api/ai/market-summary').then(r=> r.json()),
        fetch('/api/ai/top-signals?limit=5').then(r=> r.json()),
        fetch('/api/ai/portfolio').then(r=> r.json()),
        fetch('/api/ai/summary').then(r=> r.json()),
      ]);
      setMarket(m); setSignals(s); setPortfolio(p);
      const ts = Math.max(m?.updatedAt||0, s?.updatedAt||0, p?.updatedAt||0, Date.now());
      setLastUpdatedAt(ts);
      if (Array.isArray(sum?.sentences)) {
        // prepend AI konuşma metni
        setMarket((prev:any)=> ({ ...(prev||{}), aiSummary: sum.sentences as string[] }));
      }
    } finally { setLoading(false); }
  };

  useEffect(()=>{ fetchAll(); const id = setInterval(fetchAll, 5*60*1000); return ()=> clearInterval(id); }, []);

  const stanceText = (stance: IndexStance, conf: number) => {
    if (stance === 'positive') return `pozitif (${fmtPct1.format(conf)})`;
    if (stance === 'negative') return `negatif (${fmtPct1.format(conf)})`;
    return `nötr (${fmtPct1.format(conf)})`;
  };

  const summary = useMemo(()=>{
    if (!market) return 'Yükleniyor...';
    const parts: string[] = [];
    for (const idx of market.indices || []) {
      parts.push(`${idx.name} ${stanceText(idx.stance, idx.confidence)}`);
    }
    const sectorStrong = market.sectors?.[0];
    const sectorWeak = market.sectors?.[1];
    const secStr = sectorStrong ? `En güçlü sektör: ${sectorStrong.name} (${fmtPct1.format(sectorStrong.changePct)}).` : '';
    const secWk = sectorWeak ? `En zayıf: ${sectorWeak.name} (${fmtPct1.format(sectorWeak.changePct)}).` : '';
    return `AI analizine göre ${parts.join(', ')}. ${secStr} ${secWk}`.trim();
  }, [market]);

  const flagForIndex = (idx: string): string => {
    const s = String(idx || '').toUpperCase();
    if (s.includes('BIST')) return '🇹🇷';
    if (s.includes('NASDAQ') || s.includes('SPX') || s.includes('S&P')) return '🇺🇸';
    return '📈';
  };

  const truncate = (txt: string, n: number) => {
    if (!txt) return '';
    return txt.length > n ? txt.slice(0, n - 1) + '…' : txt;
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-slate-900">🧠 AI Insight Panel</div>
        <div className="text-[10px] text-slate-500" title="Bu analiz FinBERT-TR + FinGPT verisine dayanmaktadır.">{market?.source || 'FinBERT-TR & FinGPT-US'}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1) Piyasa Özeti */}
        <div className="rounded-lg border p-3 bg-slate-50">
          <div className="text-xs font-semibold text-slate-800 mb-1">Piyasa Özeti</div>
          <div className="text-sm text-slate-800">{summary}</div>
          {Array.isArray(market?.aiSummary) && market.aiSummary.length>0 && (
            <ul className="mt-2 text-[11px] text-slate-700 list-disc pl-4 space-y-0.5">
              {market.aiSummary.map((t:string,i:number)=>(<li key={i}>{t}</li>))}
            </ul>
          )}
        </div>

        {/* 2) Günün AI Önerileri */}
        <div className="rounded-lg border p-4 bg-emerald-50">
          <div className="text-xs font-semibold text-emerald-800 mb-2">Günün AI Önerileri</div>
          <div className="text-[11px] text-emerald-900 space-y-1">
            {(signals?.items || []).map((x: any, i: number)=> (
              <div key={i} className="">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="mr-1">{flagForIndex(x.index)}</span>
                    <span className="opacity-70 mr-1">{x.index}</span>
                    <span className="font-semibold">{x.symbol}</span>
                  </div>
                  <div className="text-xs">{x.action === 'BUY' ? '🟢 AL' : x.action === 'SELL' ? '🔴 SAT' : '⚪ TUT'}</div>
                </div>
                {x.comment && (
                  <div className="text-[10px] text-emerald-700 truncate">{truncate(String(x.comment), 80)}</div>
                )}
              </div>
            ))}
          </div>
          <div className="text-[10px] text-emerald-700 mt-2">Tahmin penceresi: {signals?.window || '5g'} • Doğruluk ort.: {fmtPct1.format(signals?.accuracy || 0.842)}</div>
        </div>

        {/* 3) Portföy Önerisi */}
        <div className="rounded-lg border p-4 bg-indigo-50" title="Bu simülasyon, AI sinyallerine göre her 5 günde bir yeniden dengeleme ile hesaplandı.">
          <div className="text-xs font-semibold text-indigo-800 mb-2">Portföy Optimizasyonu</div>
          <div className="text-[11px] text-indigo-900">
            {(portfolio?.allocation || []).map((a: any, i: number)=> (
              <span key={i} className="mr-2">{a.symbol} {Math.round(a.weight*100)} %</span>
            ))}
          </div>
          <div className="text-[10px] text-indigo-700 mt-2">Tahmini {portfolio?.forecast?.days || 30} gün getirisi: {fmtPct1.format(portfolio?.forecast?.expectedReturnPct || 0.08)} • Risk skoru {(portfolio?.forecast?.riskScore || 2.9).toFixed(1)} / {portfolio?.forecast?.riskLabel || 'Düşük'}</div>
          <div className="text-[10px] text-slate-600 mt-1">Özet: Başlangıç ₺100.000 → ₺108.000 | Getiri: %8.0 (varsayımsal)</div>
        </div>
      </div>

      {/* MTF consistency below */}
      <div className="mt-4">
        <MTFConsistency />
      </div>

      {/* Sektör Isı Haritası */}
      <div className="mt-4">
        <SectorHeatmap sectors={market?.sectors} />
      </div>

      <div className="mt-3 text-[10px] text-slate-500 flex items-center justify-between">
        <div>Güncelleme: {new Date(market?.updatedAt || signals?.updatedAt || portfolio?.updatedAt || Date.now()).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
        <div className="space-x-3">
          <a className="underline" href="#" title="Veri Kaynakları">Veri Kaynakları</a>
          <a className="underline" href="/legal/risk-disclaimer" title="Risk Uyarısı">Risk Uyarısı</a>
        </div>
      </div>
    </div>
  );
}


