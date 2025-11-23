"use client";

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ArrowRight, TrendingUp, Brain, BarChart3, MessageSquare, Shield, Check, Star, Zap, Target, PieChart, Newspaper, DollarSign, Activity, LineChart, TrendingDown, AlertCircle, Info, Clock, Users, Award } from 'lucide-react';
import Link from 'next/link';

// Dynamic imports for Recharts (SSR-safe)
const EquityCurveChart = dynamic(
  () => import('@/components/Charts/EquityCurveChart'),
  { ssr: false, loading: () => <div className="h-[300px] bg-slate-100 rounded-lg animate-pulse" /> }
);

const SentimentPieChart = dynamic(
  () => import('@/components/Charts/SentimentPieChart'),
  { ssr: false, loading: () => <div className="h-[250px] bg-slate-100 rounded-lg animate-pulse" /> }
);

// Mock data generators
const generateStockData = (market: 'BIST' | 'US') => {
  const bistStocks = ['THYAO', 'AKBNK', 'EREGL', 'SISE', 'TUPRS', 'GARAN', 'BIMAS', 'TOASO', 'ASELS', 'HALKB'];
  const usStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'NFLX', 'AMD', 'INTC'];
  const stocks = market === 'BIST' ? bistStocks : usStocks;
  
  return stocks.map(symbol => ({
    symbol,
    price: market === 'BIST' ? (Math.random() * 200 + 10).toFixed(2) : (Math.random() * 500 + 50).toFixed(2),
    change: (Math.random() * 10 - 5).toFixed(2),
    signal: Math.random() > 0.5 ? 'BUY' : 'HOLD',
    confidence: Math.floor(Math.random() * 30 + 70)
  }));
};

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [activeMarket, setActiveMarket] = useState<'BIST' | 'US'>('BIST');
  const [stockData, setStockData] = useState<ReturnType<typeof generateStockData>>([]);
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
    setStockData(generateStockData('BIST'));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setStockData(generateStockData(activeMarket));
    const interval = setInterval(() => {
      setStockData(generateStockData(activeMarket));
      setTickerIndex(prev => (prev + 1) % 10);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeMarket, mounted]);

  const equityCurveData = useMemo(() => {
    if (!mounted) return [];
    return Array.from({ length: 12 }, (_, i) => ({
      month: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'][i],
      value: 100 + i * 1.5 + Math.sin(i) * 2,
      benchmark: 100 + i * 1.2
    }));
  }, [mounted]);

  const sentimentData = useMemo(() => {
    if (!mounted) return [];
    return [
      { name: 'Pozitif', value: 64, color: '#10b981' },
      { name: 'Nötr', value: 24, color: '#94a3b8' },
      { name: 'Negatif', value: 12, color: '#ef4444' }
    ];
  }, [mounted]);

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full mb-6">
                <Activity className="w-4 h-4 text-emerald-700" />
                <span className="text-sm font-semibold text-emerald-700">AI-Powered Trading</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
                Yapay Zeka ile<br />
                <span className="text-slate-600">Akıllı Yatırım</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl">
                BIST ve ABD borsalarında AI destekli analiz, gerçek zamanlı sinyaller ve portföy optimizasyonu. Profesyonel yatırımcıların tercihi.
              </p>
              <div className="flex flex-wrap gap-4 mb-12">
                <Link
                  href="/login"
                  className="px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition flex items-center gap-2 shadow-lg"
                >
                  Hemen Başla
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="px-8 py-4 border-2 border-slate-300 text-slate-900 rounded-xl font-semibold hover:border-slate-400 transition">
                  Demo İzle
                </button>
              </div>
              <div className="flex items-center gap-8 text-sm">
                <div>
                  <div className="text-2xl font-bold text-slate-900">87.3%</div>
                  <div className="text-slate-600">Doğruluk Oranı</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">30+</div>
                  <div className="text-slate-600">Aktif Sinyal</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">24/7</div>
                  <div className="text-slate-600">Canlı Analiz</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Canlı Hisse Akışı</h3>
                <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveMarket('BIST')}
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
                      activeMarket === 'BIST' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    BIST
                  </button>
                  <button
                    onClick={() => setActiveMarket('US')}
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
                      activeMarket === 'US' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    ABD
                  </button>
                </div>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {mounted && stockData.length > 0 ? (
                  stockData.slice(0, 10).map((stock, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${stock.signal === 'BUY' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <div>
                          <div className="font-bold text-slate-900">{stock.symbol}</div>
                          <div className="text-xs text-slate-500">{stock.signal}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-900">₺{stock.price}</div>
                        <div className={`text-sm font-medium ${parseFloat(stock.change) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {parseFloat(stock.change) >= 0 ? '+' : ''}{stock.change}%
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KPI Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">87.3%</div>
                  <div className="text-sm text-slate-600">Doğruluk Oranı</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">30+</div>
                  <div className="text-sm text-slate-600">Aktif Sinyal</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">24/7</div>
                  <div className="text-sm text-slate-600">Canlı Analiz</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">1.2K+</div>
                  <div className="text-sm text-slate-600">Aktif Kullanıcı</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Live AI Stock Ticker */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Canlı AI Sinyalleri</h2>
            <p className="text-xl text-slate-600">Gerçek zamanlı yapay zeka analizi ile en güncel sinyaller</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveMarket('BIST')}
                    className={`px-6 py-3 rounded-lg font-semibold transition ${
                      activeMarket === 'BIST' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    🇹🇷 BIST 30
                  </button>
                  <button
                    onClick={() => setActiveMarket('US')}
                    className={`px-6 py-3 rounded-lg font-semibold transition ${
                      activeMarket === 'US' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    🇺🇸 ABD Borsası
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span>Canlı</span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Sembol</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Fiyat</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Değişim</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">AI Sinyal</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Güven</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mounted && stockData.length > 0 ? (
                    stockData.map((stock, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{stock.symbol}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-semibold text-slate-900">₺{stock.price}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className={`font-semibold ${parseFloat(stock.change) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {parseFloat(stock.change) >= 0 ? '+' : ''}{stock.change}%
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            stock.signal === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {stock.signal}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${stock.confidence}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-slate-600">{stock.confidence}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    [...Array(10)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-5 w-20 bg-slate-200 rounded" /></td>
                        <td className="px-6 py-4"><div className="h-5 w-24 bg-slate-200 rounded ml-auto" /></td>
                        <td className="px-6 py-4"><div className="h-5 w-20 bg-slate-200 rounded ml-auto" /></td>
                        <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-200 rounded-full mx-auto" /></td>
                        <td className="px-6 py-4"><div className="h-2 w-32 bg-slate-200 rounded-full mx-auto" /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AI Top 30 Screener */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full mb-4">
              <Activity className="w-4 h-4 text-emerald-700" />
              <span className="text-sm font-semibold text-emerald-700">Canlı Tarama</span>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">AI Top 30 Hisse Tarayıcı</h2>
            <p className="text-xl text-slate-600 mb-2">Her 3 saniyede güncellenen gerçek zamanlı AI analizi</p>
            <p className="text-sm text-slate-500">LightGBM + LSTM ensemble modeli ile %87.3 doğruluk oranı</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">BIST 30 - AI Analiz Sonuçları</h3>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span>Son güncelleme: {mounted ? new Date().toLocaleTimeString('tr-TR') : 'Yükleniyor...'}</span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Sembol</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Fiyat</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Değişim</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Sinyal</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Güven</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mounted && stockData.length > 0 ? (
                    stockData.slice(0, 10).map((stock, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-bold text-slate-900">{stock.symbol}</td>
                        <td className="px-6 py-4 text-right font-semibold text-slate-900">₺{stock.price}</td>
                        <td className={`px-6 py-4 text-right font-semibold ${parseFloat(stock.change) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {parseFloat(stock.change) >= 0 ? '+' : ''}{stock.change}%
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            stock.signal === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {stock.signal}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stock.confidence}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-slate-600">{stock.confidence}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    [...Array(10)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-5 w-20 bg-slate-200 rounded" /></td>
                        <td className="px-6 py-4"><div className="h-5 w-24 bg-slate-200 rounded ml-auto" /></td>
                        <td className="px-6 py-4"><div className="h-5 w-20 bg-slate-200 rounded ml-auto" /></td>
                        <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-200 rounded-full mx-auto" /></td>
                        <td className="px-6 py-4"><div className="h-2 w-32 bg-slate-200 rounded-full mx-auto" /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AI Modules */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full mb-4">
              <Zap className="w-4 h-4 text-slate-900" />
              <span className="text-sm font-semibold text-slate-900">AI Powered</span>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">AI Modülleri</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Yapay zeka destekli profesyonel yatırım araçları. Her modül, derin öğrenme ve doğal dil işleme teknolojileriyle güçlendirilmiştir.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold text-slate-900">TraderGPT</h3>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded font-semibold">🤖 AI</span>
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed">
                GPT-4 tabanlı AI asistanınız. Yatırım stratejilerinizi geliştirin, sorularınızı sorun, gerçek zamanlı analiz alın.
              </p>
              <Link href="/feature/tradergpt" className="text-purple-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Keşfet <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold text-slate-900">Viz</h3>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold">📊 Viz</span>
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Gelişmiş görselleştirme ve teknik analiz. Candlestick, volume, RSI, MACD ve 50+ indikatör ile profesyonel analiz.
              </p>
              <Link href="/feature/viz" className="text-blue-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Keşfet <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold text-slate-900">AI Sinyaller</h3>
                <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-semibold">🧠 AI</span>
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed">
                LightGBM + LSTM + TimeGPT ensemble modeli. Gerçek zamanlı sinyaller, %87.3 doğruluk oranı, otomatik risk yönetimi.
              </p>
              <Link href="/feature/bist30" className="text-emerald-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Keşfet <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold text-slate-900">AI Commentary</h3>
                <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded font-semibold">🤖 AI Commentary</span>
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed">
                FinBERT-TR ile Türkçe haber analizi. Her hisse için detaylı AI yorumu, sentiment skoru ve trend tahmini.
              </p>
              <Link href="/feature/commentary" className="text-amber-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Keşfet <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Daily AI Market Summary */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">AI Günlük Piyasa Özeti</h2>
            <p className="text-xl text-slate-600">Yapay zeka tarafından analiz edilen günlük piyasa durumu</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Piyasa Analizi</h3>
                <p className="text-sm text-slate-600">Son güncelleme: {mounted ? new Date().toLocaleString('tr-TR') : 'Yükleniyor...'}</p>
              </div>
            </div>
            <div className="space-y-4 text-slate-700 leading-relaxed">
              <p>
                <strong className="text-slate-900">BIST 100</strong> için AI sentiment analizi <strong className="text-emerald-600">%71 pozitif</strong> (FinBERT-TR). 
                Model, <strong className="text-slate-900">THYAO</strong> ve <strong className="text-slate-900">SISE</strong> için momentum tabanlı alım sinyali verdi (pencere: son 4 saat).
              </p>
              <p>
                <strong className="text-slate-900">Teknoloji sektörü</strong> <strong className="text-emerald-600">+3.8%</strong> ile lider konumda. 
                <strong className="text-slate-900">Bankacılık</strong> sektörü <strong className="text-red-600">-1.4%</strong> ile gerileme gösteriyor.
              </p>
              <div className="pt-4 border-t border-blue-200">
                <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                  <span>📚 FinBERT-TR v2.1</span>
                  <span>•</span>
                  <span>MetaModel Ensemble v1.4</span>
                  <span>•</span>
                  <span>Data Window: 4h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. AI Portfolio Recommendation */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">AI Portföy Önerisi</h2>
            <p className="text-xl text-slate-600">Yapay zeka destekli portföy optimizasyonu ve risk yönetimi</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Önerilen Dağılım</h3>
              <div className="space-y-4">
                {[
                  { symbol: 'THYAO', weight: 40, color: 'bg-emerald-500' },
                  { symbol: 'EREGL', weight: 30, color: 'bg-blue-500' },
                  { symbol: 'SISE', weight: 30, color: 'bg-purple-500' }
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900">{item.symbol}</span>
                      <span className="text-sm font-semibold text-slate-600">{item.weight}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.weight}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Tahmini Getiri</div>
                    <div className="text-3xl font-bold text-emerald-600">+8.2%</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Risk Skoru</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '62%' }} />
                      </div>
                      <span className="text-xl font-bold text-slate-900">3.1</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Düşük risk</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Portföy Performansı</h3>
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-500">Grafik buraya eklenecek</p>
              </div>
              <div className="mt-6 text-sm text-slate-600">
                <p>Simülasyon modeli: MetaRisk v2.1 (AI sinyallerine göre 5 günlük yeniden dengeleme)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Backtest Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Backtest Performansı</h2>
            <p className="text-xl text-slate-600">AI modelinin geçmiş performans analizi</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Performans Metrikleri</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-600">Ortalama Getiri</span>
                    <span className="text-2xl font-bold text-emerald-600">+8.6%</span>
                  </div>
                  <p className="text-xs text-slate-500">Son 30 gün, BIST30</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-600">Kazanma Oranı</span>
                    <span className="text-2xl font-bold text-slate-900">72.5%</span>
                  </div>
                  <p className="text-xs text-slate-500">40 işlemden 29'u başarılı</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-600">Sharpe Ratio</span>
                    <span className="text-2xl font-bold text-slate-900">1.85</span>
                  </div>
                  <p className="text-xs text-slate-500">Vergi & komisyon dahil</p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-200">
                <h4 className="text-sm font-semibold text-slate-900 mb-4">Test Parametreleri</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Komisyon:</span>
                    <span className="ml-2 font-semibold text-slate-900">%0.1</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Slipaj:</span>
                    <span className="ml-2 font-semibold text-slate-900">%0.05</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Vergi:</span>
                    <span className="ml-2 font-semibold text-emerald-600">Dahil</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Rebalans:</span>
                    <span className="ml-2 font-semibold text-slate-900">5 gün</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-4">
                  Walk-forward backtest, 90 günlük rolling window, no look-ahead.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Equity Curve (12 Ay)</h3>
              {mounted && equityCurveData.length > 0 ? (
                <EquityCurveChart data={equityCurveData} />
              ) : (
                <div className="h-[300px] bg-slate-100 rounded-lg animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 9. News Sentiment Analysis */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Haber & Sentiment Analizi</h2>
            <p className="text-xl text-slate-600">FinBERT-TR ile Türkçe haber analizi ve duygu skorları</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Sentiment Dağılımı</h3>
                  <p className="text-sm text-slate-500">142 haber analizi</p>
                </div>
              </div>
              {mounted && sentimentData.length > 0 ? (
                <SentimentPieChart data={sentimentData} />
              ) : (
                <div className="h-[250px] bg-slate-100 rounded-lg animate-pulse" />
              )}
              <div className="mt-6 space-y-3 pt-6 border-t border-slate-200">
                {[
                  { label: 'Pozitif', value: 64, color: '#10b981', count: 91 },
                  { label: 'Nötr', value: 24, color: '#94a3b8', count: 34 },
                  { label: 'Negatif', value: 12, color: '#ef4444', count: 17 }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded" style={{ background: item.color }} />
                      <span className="font-semibold text-slate-900">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-600">{item.count} haber</span>
                      <span className="text-lg font-bold text-slate-900">{item.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-purple-900 mb-1">FinBERT-TR Modeli</div>
                    <p className="text-xs text-purple-700 leading-relaxed">
                      Türkçe doğal dil işleme için özel eğitilmiş BERT modeli. Finansal haberlerde %94 doğruluk oranı ile sentiment analizi yapar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Son Haberler</h3>
              <div className="space-y-4">
                {[
                  { title: 'THYAO için güçlü momentum sinyali tespit edildi', sentiment: 'Pozitif', confidence: 92, time: '2 saat önce', source: 'BloombergHT' },
                  { title: 'BIST 100 endeksi rekor seviyeye ulaştı', sentiment: 'Pozitif', confidence: 88, time: '5 saat önce', source: 'AA' },
                  { title: 'Teknoloji sektöründe güçlü büyüme', sentiment: 'Pozitif', confidence: 87, time: '8 saat önce', source: 'Hürriyet' }
                ].map((news, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-slate-900 leading-snug flex-1">{news.title}</h4>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ml-3 ${
                        news.sentiment === 'Pozitif' 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                          : 'bg-red-100 text-red-700 border border-red-300'
                      }`}>
                        {news.sentiment}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>{news.time}</span>
                        <span>•</span>
                        <span className="font-medium">{news.source}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${news.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700">{news.confidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Pricing Table */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Fiyatlandırma</h2>
            <p className="text-xl text-slate-600">İhtiyacınıza uygun planı seçin</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">₺0</span>
                <span className="text-slate-600">/aylık</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-600">Günlük 10 sinyal</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-600">Temel analiz araçları</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-600">E-posta desteği</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-600">Topluluk erişimi</span>
                </li>
              </ul>
              <button className="w-full py-3 rounded-xl font-semibold transition bg-slate-100 text-slate-900 hover:bg-slate-200">
                Ücretsiz Başla
              </button>
            </div>

            <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-xl p-8 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-slate-900 text-white text-xs font-semibold px-3 py-1 rounded-full">En Popüler</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">₺299</span>
                <span className="text-slate-600">/aylık</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-600">Sınırsız sinyal</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-600">Gelişmiş AI modülleri</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-600">Öncelikli destek</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-600">Portföy optimizasyonu</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-600">Backtest araçları</span>
                </li>
              </ul>
              <button className="w-full py-3 rounded-xl font-semibold transition bg-slate-900 text-white hover:bg-slate-800">
                Pro'ya Geç
              </button>
            </div>

            <div className="bg-white rounded-2xl border-2 border-slate-200 p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Elite</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">₺999</span>
                <span className="text-slate-600">/aylık</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-600">Tüm Pro özellikleri</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-600">Özel AI modeli</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-600">7/24 destek</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-600">API erişimi</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-600">Özel eğitim</span>
                </li>
              </ul>
              <button className="w-full py-3 rounded-xl font-semibold transition bg-slate-100 text-slate-900 hover:bg-slate-200">
                Elite'e Geç
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-8 h-8" />
                <span className="text-xl font-bold">BIST AI</span>
              </div>
              <p className="text-slate-400">Yapay zeka destekli yatırım platformu</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ürün</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="#features" className="hover:text-white transition">Özellikler</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition">Fiyatlandırma</Link></li>
                <li><Link href="/feature/bist30" className="hover:text-white transition">AI Sinyaller</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Şirket</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/legal/kvkk" className="hover:text-white transition">KVKK</Link></li>
                <li><Link href="/legal/privacy" className="hover:text-white transition">Gizlilik</Link></li>
                <li><Link href="/legal/risk-disclaimer" className="hover:text-white transition">Risk Bildirimi</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">İletişim</h4>
              <ul className="space-y-2 text-slate-400">
                <li>destek@bistai.com</li>
                <li>+90 (212) 123 45 67</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>© 2025 BIST AI. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
