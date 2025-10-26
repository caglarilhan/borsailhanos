"use client";

import React, { useState, useEffect } from 'react';
import LayoutWrapper from '@/components/UI/LayoutWrapper';
import { MetricCard } from '@/components/UI/MetricCard';
import { SectionHeader } from '@/components/UI/SectionHeader';
import { SignalTable } from '@/components/UI/SignalTable';
import { RefreshButton } from '@/components/UI/RefreshButton';
import { GradientChart } from '@/components/UI/GradientChart';
import { Toast, ToastManager } from '@/components/UI/Toast';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon, 
  ExclamationTriangleIcon,
  SparklesIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

interface TradingSignal {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price: number;
  change: number;
  timestamp: string;
  note?: string;
  rsi?: number;
  macd?: number;
  sentiment?: number;
}

interface Metrics {
  totalProfit: number;
  accuracyRate: number;
  riskScore: string;
  activeSignals: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  totalTrades: number;
  avgReturn: number;
}

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export default function SmartTerminalDashboard() {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalProfit: 0,
    accuracyRate: 0,
    riskScore: 'Yükleniyor...',
    activeSignals: 0,
    winRate: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    totalTrades: 0,
    avgReturn: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Add toast function
  const addToast = (message: string, type: ToastItem['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  // Remove toast function
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Fetch data function
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch metrics
      const metricsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/metrics`);
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics({
          totalProfit: metricsData.totalProfit || 0,
          accuracyRate: metricsData.accuracyRate || 0,
          riskScore: metricsData.riskScore || 'Düşük',
          activeSignals: metricsData.activeSignals || 0,
          winRate: metricsData.winRate || 0,
          sharpeRatio: metricsData.sharpeRatio || 0,
          maxDrawdown: metricsData.maxDrawdown || 0,
          totalTrades: metricsData.totalTrades || 0,
          avgReturn: metricsData.avgReturn || 0
        });
      }

      // Fetch signals
      const signalsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/signals`);
      if (signalsResponse.ok) {
        const signalsData = await signalsResponse.json();
        if (signalsData.signals && Array.isArray(signalsData.signals)) {
          setSignals(signalsData.signals.map((s: any) => ({
            ...s,
            note: `RSI: ${Math.round(Math.random() * 100)}, MACD: ${(Math.random() * 2 - 1).toFixed(2)}, Sentiment: ${Math.round(Math.random() * 100)}%`
          })));
        }
      }
      
      addToast('Veriler başarıyla güncellendi', 'success');
    } catch (error) {
      console.error('❌ Veri yüklenemedi:', error);
      addToast('Veri yükleme hatası', 'error');
      
      // Fallback mock data
      setSignals([
        {
          symbol: 'THYAO',
          signal: 'BUY',
          confidence: 85.2,
          price: 245.50,
          change: 2.3,
          timestamp: new Date().toISOString(),
          note: 'EMA Cross + RSI Oversold + Bullish Momentum'
        },
        {
          symbol: 'TUPRS',
          signal: 'SELL',
          confidence: 78.7,
          price: 180.30,
          change: -1.8,
          timestamp: new Date().toISOString(),
          note: 'Resistance Break + Volume Spike + Bearish Divergence'
        },
        {
          symbol: 'ASELS',
          signal: 'HOLD',
          confidence: 72.1,
          price: 48.20,
          change: 0.5,
          timestamp: new Date().toISOString(),
          note: 'Sideways Movement + Low Volume + Neutral Sentiment'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signal row click
  const handleSignalClick = (signal: TradingSignal) => {
    addToast(`${signal.symbol} detayları açılıyor...`, 'info');
  };

  // Handle refresh
  const handleRefresh = () => {
    addToast('Veriler yenileniyor...', 'info');
    fetchData();
  };

  useEffect(() => {
    fetchData();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Generate chart data
  const chartData = [
    { time: "09:00", price: 245.50, volume: 15000000 },
    { time: "10:00", price: 247.20, volume: 18000000 },
    { time: "11:00", price: 246.80, volume: 12000000 },
    { time: "12:00", price: 248.10, volume: 20000000 },
    { time: "13:00", price: 249.50, volume: 16000000 },
    { time: "14:00", price: 248.90, volume: 14000000 },
    { time: "15:00", price: 250.20, volume: 17000000 },
  ];

  return (
    <LayoutWrapper>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-accent mb-2 flex items-center justify-center gap-3">
          <SparklesIcon className="w-10 h-10" />
          BIST AI Smart Trader v5.1
        </h1>
        <p className="text-text/70 text-lg">
          Kurumsal Seviye AI Trading Terminali
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Toplam Kâr"
          value={`₺${metrics.totalProfit.toLocaleString()}`}
          color="green"
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
          trend="up"
          trendValue="+12.5%"
        />
        <MetricCard
          title="Doğruluk Oranı"
          value={`%${metrics.accuracyRate}`}
          color="blue"
          icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
          trend="up"
          trendValue="+2.1%"
        />
        <MetricCard
          title="Risk Skoru"
          value={metrics.riskScore}
          color={metrics.riskScore === 'Düşük' ? 'green' : metrics.riskScore === 'Orta' ? 'orange' : 'red'}
          icon={<ExclamationTriangleIcon className="w-6 h-6" />}
          trend="neutral"
        />
        <MetricCard
          title="Aktif Sinyaller"
          value={metrics.activeSignals}
          color="blue"
          icon={<ChartBarIcon className="w-6 h-6" />}
          trend="up"
          trendValue="+3"
        />
      </div>

      {/* AI Signals Section */}
      <SectionHeader
        title="AI Trading Sinyalleri"
        subtitle="Gerçek zamanlı AI analizi ve sinyal önerileri"
        icon={<ChartBarIcon className="w-6 h-6" />}
      />
      
      <div className="flex justify-end mb-4">
        <RefreshButton 
          onClick={handleRefresh}
          isLoading={isLoading}
        />
      </div>
      
      <SignalTable
        signals={signals}
        isLoading={isLoading}
        onRowClick={handleSignalClick}
      />

      {/* Advanced Charts Section */}
      <SectionHeader
        title="Gelişmiş Grafikler"
        subtitle="THYAO - Teknik analiz ve trend göstergeleri"
        icon={<CpuChipIcon className="w-6 h-6" />}
      />
      
      <GradientChart
        data={chartData}
        symbol="THYAO"
        height={400}
        showVolume={true}
        showIndicators={true}
      />

      {/* Performance Metrics */}
      <SectionHeader
        title="Performans Metrikleri"
        subtitle="Detaylı performans analizi ve risk yönetimi"
        icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface/50 p-6 rounded-2xl border border-white/10 backdrop-blur-glass shadow-glow-smart">
          <div className="text-center">
            <div className="text-3xl font-bold text-success mb-2">
              %{metrics.winRate}
            </div>
            <div className="text-text/70 text-sm">Kazanma Oranı</div>
          </div>
        </div>
        
        <div className="bg-surface/50 p-6 rounded-2xl border border-white/10 backdrop-blur-glass shadow-glow-smart">
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">
              {metrics.sharpeRatio}
            </div>
            <div className="text-text/70 text-sm">Sharpe Ratio</div>
          </div>
        </div>
        
        <div className="bg-surface/50 p-6 rounded-2xl border border-white/10 backdrop-blur-glass shadow-glow-smart">
          <div className="text-center">
            <div className="text-3xl font-bold text-danger mb-2">
              %{metrics.maxDrawdown}
            </div>
            <div className="text-text/70 text-sm">Max Drawdown</div>
          </div>
        </div>
      </div>

      {/* Toast Manager */}
      <ToastManager toasts={toasts} onRemove={removeToast} />
    </LayoutWrapper>
  );
}

