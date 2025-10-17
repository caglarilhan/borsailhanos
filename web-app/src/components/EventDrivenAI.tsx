'use client';

import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/config';

export default function EventDrivenAI() {
  const [symbols, setSymbols] = useState('THYAO,ASELS,AAPL,MSFT');
  const [news, setNews] = useState<any[]>([]);
  const [text, setText] = useState('Şirket yeni yatırım açıkladı.');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadNews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/news_stream?symbols=${encodeURIComponent(symbols)}&limit=20`, { cache: 'no-store' });
      const json = await res.json();
      setNews(Array.isArray(json?.items) ? json.items : []);
    } finally {
      setLoading(false);
    }
  };

  const runOTE = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ text, symbol: 'THYAO' });
      const res = await fetch(`${API_BASE_URL}/api/events/sentiment_ote?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      setAnalysis(json);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNews(); }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900">Event-Driven AI (FinBERT + OTE stub)</div>
        <div className="flex items-center gap-2">
          <input value={symbols} onChange={(e)=>setSymbols(e.target.value)} className="px-2 py-1 border rounded text-sm w-72" />
          <button onClick={loadNews} className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-50" disabled={loading}>{loading?'Yükleniyor…':'Haberleri Al'}</button>
        </div>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Haber Akışı</div>
          <div className="space-y-2 max-h-72 overflow-auto">
            {news.map((n,i)=> (
              <div key={i} className="border rounded p-2">
                <div className="text-xs text-gray-500">{n.symbol} • {n.source} • {new Date(n.timestamp).toLocaleTimeString('tr-TR')}</div>
                <div className="text-sm text-gray-900">{n.headline}</div>
              </div>
            ))}
            {news.length===0 && <div className="text-sm text-gray-500">Kayıt yok</div>}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Sentiment + Olay Türü Çıkarımı</div>
          <div className="flex items-center gap-2 mb-2">
            <input value={text} onChange={(e)=>setText(e.target.value)} className="px-2 py-1 border rounded text-sm flex-1" />
            <button onClick={runOTE} className="px-3 py-1 text-sm bg-purple-600 text-white rounded disabled:opacity-50" disabled={loading}>{loading?'Analiz…':'Analiz Et'}</button>
          </div>
          {analysis ? (
            <div className="text-sm">
              <div>Sentiment: <span className={analysis.sentiment>=0?'text-green-600':'text-red-600'}>{analysis.sentiment}</span> ({analysis.direction})</div>
              <div>Olay Türü: <span className="font-medium">{analysis.event_type}</span> ({Math.round(analysis.event_strength*100)}%)</div>
              <div>Mean-Reversion Boost: x{analysis.mean_reversion_boost}</div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Analiz yok</div>
          )}
        </div>
      </div>
    </div>
  );
}


