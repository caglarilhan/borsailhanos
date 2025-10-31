'use client';

import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { useTop30Analysis } from '@/hooks/queries';
import { Skeleton } from '@/components/UI/Skeleton';

interface AISummary {
  rsi: number;
  rsi_status: string;
  volatility_7d: number;
  volatility_trend: string;
  volume_change: number;
  correlation_top_stock: string;
  correlation_value: number;
  sector_performance_7d: number;
  sentiment_score: number;
  news_count_24h: number;
  price_change_7d: number;
}

interface Top30Stock {
  symbol: string;
  rank: number;
  potential: number;
  confidence: number;
  accuracy: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  trend: 'up' | 'down';
  currentPrice: number;
  predictedChange: number;
  reasons: string[];
  sparkline: number[];
  volume24h: number;
  marketCap: number;
  aiSummary?: AISummary;
  aiSummaryText?: string;
}

interface SectorAnalysis {
  top2: Array<{ symbol: string; potential: number; signal: string }>;
  sectorPerformance: number;
  buyCount: number;
}

interface AISummaryData {
  text: string;
  buyCount: number;
  sellCount: number;
  holdCount: number;
  strongestSector: string | null;
  top3Symbols: string[];
  highAccuracyCount: number;
}

interface Top30AnalysisData {
  timestamp: string;
  analysisDate: string;
  analysisHour?: number;
  rotationSeed?: number;
  market: string;
  top30: Top30Stock[];
  top10Screener?: Top30Stock[];  // %80+ doğruluk
  news: Array<{ title: string; impact: string; time: number }>;
  sectorAnalysis?: Record<string, SectorAnalysis>;
  aiSummary?: AISummaryData;
  metadata: {
    totalAnalyzed: number;
    avgPotential: number;
    avgConfidence: number;
    buySignals: number;
    holdSignals: number;
    sellSignals: number;
    rotationActive?: boolean;
    rotationType?: string;
  };
}

export default function Top30Analysis() {
  const q = useTop30Analysis();
  const loading = Boolean(q.isLoading || q.isFetching);
  const error = q.error ? String((q.error as any)?.message || 'Hata') : null;
  const data = (q.data as any) as Top30AnalysisData | null;

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return '#10b981'; // green
      case 'SELL': return '#ef4444'; // red
      case 'HOLD': return '#64748b'; // gray
      default: return '#64748b';
    }
  };
  const getSignalLabelTR = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'Al';
      case 'SELL': return 'Sat';
      case 'HOLD': return 'Bekle';
      default: return signal;
    }
  };

  const getSignalBg = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'rgba(16,185,129,0.1)';
      case 'SELL': return 'rgba(239,68,68,0.1)';
      case 'HOLD': return 'rgba(100,116,139,0.1)';
      default: return 'rgba(100,116,139,0.1)';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(0);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 }).format(num);
  };

  if (loading) {
    return (
      <div style={{ padding: '16px' }}>
        <Skeleton className="h-8 w-56 mb-4 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Skeleton className="h-48 rounded" />
          <Skeleton className="h-48 rounded" />
          <Skeleton className="h-48 rounded" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
        <div>❌ {error || 'Veri bulunamadı'}</div>
      </div>
    );
  }

  // Sparkline grafik için data format
  const prepareSparklineData = (sparkline: number[]) => {
    return sparkline.map((price, idx) => ({ day: idx + 1, price }));
  };

  return (
    <div style={{ padding: '0' }}>
      {/* 🤖 AI Summary Box */}
      {data.aiSummary && (
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          color: '#fff',
          boxShadow: '0 4px 20px rgba(16,185,129,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px' }}>🤖</span>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>AI Özet Rapor</h2>
            {data.analysisHour !== undefined && (
              <span style={{ fontSize: '12px', opacity: 0.9, marginLeft: 'auto' }}>
                Saat: {data.analysisHour}:00 | Rotasyon: {data.metadata.rotationType || 'aktif'}
              </span>
            )}
          </div>
          <p style={{ fontSize: '14px', margin: 0, lineHeight: '1.6', opacity: 0.95, marginBottom: '12px' }}>
            {data.aiSummary.text}
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              backdropFilter: 'blur(10px)'
            }}>
              🟢 {data.aiSummary.buyCount} BUY
            </span>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              backdropFilter: 'blur(10px)'
            }}>
              🔴 {data.aiSummary.sellCount} SELL
            </span>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              backdropFilter: 'blur(10px)'
            }}>
              ⚪ {data.aiSummary.holdCount} HOLD
            </span>
            {data.aiSummary.strongestSector && (
              <span style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                backdropFilter: 'blur(10px)'
              }}>
                🏆 En Güçlü: {data.aiSummary.strongestSector}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 🎯 Top 10 Screener - %80+ Doğruluk */}
      {data.top10Screener && data.top10Screener.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          border: '2px solid rgba(16,185,129,0.3)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '20px' }}>🎯</span>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Top 10 Screener (%80+ Doğruluk)</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {data.top10Screener.map((stock) => (
              <div key={stock.symbol} style={{
                background: getSignalBg(stock.signal),
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid ' + getSignalColor(stock.signal) + '40'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{stock.symbol}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.6)', padding: '2px 8px', borderRadius: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: getSignalColor(stock.signal), display: 'inline-block' }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>{getSignalLabelTR(stock.signal)}</span>
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Doğruluk: <strong style={{ color: '#0f172a' }}>{stock.accuracy.toFixed(1)}%</strong>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Potansiyel: <strong style={{ color: '#0f172a' }}>{stock.potential.toFixed(1)}%</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📊 Sektör Bazlı Analiz */}
      {data.sectorAnalysis && Object.keys(data.sectorAnalysis).length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          border: '2px solid rgba(139,92,246,0.3)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '20px' }}>📊</span>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Sektör Bazlı Analiz</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
            {Object.entries(data.sectorAnalysis).map(([sector, analysis]) => (
              <div key={sector} style={{
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
                  {sector}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                  Performans: <strong style={{ color: '#0f172a' }}>%{analysis.sectorPerformance.toFixed(1)}</strong>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                  BUY Sinyalleri: <strong style={{ color: '#10b981' }}>{analysis.buyCount}</strong>
                </div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                  En Güçlü 2 Hisse:
                </div>
                {analysis.top2.map((stock, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 0',
                    borderBottom: idx < analysis.top2.length - 1 ? '1px solid #e2e8f0' : 'none'
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a' }}>{stock.symbol}</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        background: stock.signal === 'BUY' ? '#10b98120' : stock.signal === 'SELL' ? '#ef444420' : '#64748b20',
                        color: stock.signal === 'BUY' ? '#10b981' : stock.signal === 'SELL' ? '#ef4444' : '#64748b',
                        borderRadius: '4px',
                        fontWeight: '600'
                      }}>
                        {stock.signal}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>%{stock.potential.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '12px', 
        marginBottom: '24px' 
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '12px',
          padding: '16px',
          border: '2px solid rgba(16,185,129,0.3)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>Ortalama Potansiyel</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>{data.metadata.avgPotential.toFixed(1)}%</div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '12px',
          padding: '16px',
          border: '2px solid rgba(59,130,246,0.3)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>Ortalama Güven</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#3b82f6' }}>{data.metadata.avgConfidence.toFixed(1)}%</div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '12px',
          padding: '16px',
          border: '2px solid rgba(139,92,246,0.3)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>BUY Sinyalleri</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#8b5cf6' }}>{data.metadata.buySignals}</div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '12px',
          padding: '16px',
          border: '2px solid rgba(239,68,68,0.3)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>Analiz Edilen</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ef4444' }}>{data.metadata.totalAnalyzed}</div>
        </div>
      </div>

      {/* Top 30 Cards Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        {data.top30.map((stock) => (
          <div
            key={stock.symbol}
            style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '16px',
              padding: '20px',
              border: '2px solid ' + getSignalColor(stock.signal) + '40',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.2s',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
            }}
          >
            {/* Rank Badge */}
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: getSignalColor(stock.signal),
              color: '#fff',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '700',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
              {stock.rank}
            </div>

            {/* Header */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {stock.symbol}
                </h3>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 10px', background: getSignalBg(stock.signal), borderRadius: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: getSignalColor(stock.signal), display: 'inline-block' }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>{getSignalLabelTR(stock.signal)}</span>
                </span>
                {/* Trend Icon */}
                {stock.trend === 'up' ? (
                  <span style={{ fontSize: '18px', color: '#10b981' }}>🟢</span>
                ) : (
                  <span style={{ fontSize: '18px', color: '#ef4444' }}>🔴</span>
                )}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                {formatCurrency(stock.currentPrice)}
                {stock.predictedChange > 0 && (
                  <span style={{ color: '#10b981', marginLeft: '8px', fontWeight: '600' }}>
                    +{stock.predictedChange.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bars */}
            <div style={{ marginBottom: '16px' }}>
              {/* Potansiyel */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Yükseliş Potansiyeli</span>
                  <span style={{ fontSize: '12px', color: '#0f172a', fontWeight: '700' }}>{stock.potential.toFixed(1)}%</span>
                </div>
                <div style={{
                  height: '8px',
                  background: '#e2e8f0',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: stock.potential + '%',
                    background: 'linear-gradient(90deg, #10b981, #3b82f6)',
                    borderRadius: '4px',
                    transition: 'width 0.5s'
                  }} />
                </div>
              </div>

              {/* AI Güven */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>AI Güven Skoru</span>
                  <span style={{ fontSize: '12px', color: '#0f172a', fontWeight: '700' }}>{stock.confidence.toFixed(1)}%</span>
                </div>
                <div style={{
                  height: '8px',
                  background: '#e2e8f0',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: stock.confidence + '%',
                    background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
                    borderRadius: '4px',
                    transition: 'width 0.5s'
                  }} />
                </div>
              </div>

              {/* Doğruluk */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Doğruluk</span>
                  <span style={{ fontSize: '12px', color: '#0f172a', fontWeight: '700' }}>{stock.accuracy.toFixed(1)}%</span>
                </div>
                <div style={{
                  height: '8px',
                  background: '#e2e8f0',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: stock.accuracy + '%',
                    background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
                    borderRadius: '4px',
                    transition: 'width 0.5s'
                  }} />
                </div>
              </div>
            </div>

            {/* AI Güven Gauge (Görsel) */}
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>AI Güven</div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  height: '32px',
                  background: stock.confidence >= 85 ? 'rgba(16,185,129,0.1)' :
                              stock.confidence >= 70 ? 'rgba(139,92,246,0.1)' :
                              'rgba(239,68,68,0.1)',
                  borderRadius: '8px',
                  padding: '0 12px',
                  border: '2px solid ' + (
                    stock.confidence >= 85 ? '#10b981' :
                    stock.confidence >= 70 ? '#8b5cf6' :
                    '#ef4444'
                  )
                }}>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: stock.confidence >= 85 ? '#10b981' :
                           stock.confidence >= 70 ? '#8b5cf6' :
                           '#ef4444'
                  }}>
                    {stock.confidence >= 85 ? '⭐⭐⭐' : stock.confidence >= 70 ? '⭐⭐' : '⭐'}
                  </span>
                  <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: stock.confidence + '%',
                      background: stock.confidence >= 85 ? 'linear-gradient(90deg, #10b981, #059669)' :
                                  stock.confidence >= 70 ? 'linear-gradient(90deg, #8b5cf6, #7c3aed)' :
                                  'linear-gradient(90deg, #ef4444, #dc2626)',
                      borderRadius: '4px',
                      transition: 'width 0.5s'
                    }} />
                  </div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: stock.confidence >= 85 ? '#10b981' :
                           stock.confidence >= 70 ? '#8b5cf6' :
                           '#ef4444',
                    minWidth: '35px'
                  }}>
                    {stock.confidence >= 85 ? 'Yüksek' : stock.confidence >= 70 ? 'Orta' : 'Düşük'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sparkline Chart */}
            <div style={{ 
              marginBottom: '16px', 
              height: '60px',
              background: '#f8fafc',
              borderRadius: '8px',
              padding: '8px'
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prepareSparklineData(stock.sparkline)}>
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15,23,42,0.95)', 
                      border: 'none', 
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '11px'
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke={getSignalColor(stock.signal)} 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 📊 Derin AI Özeti */}
            {stock.aiSummary && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(102,126,234,0.1), rgba(139,92,246,0.1))',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
                border: '1px solid rgba(102,126,234,0.2)'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#667eea', marginBottom: '8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  🤖 Derin AI Analiz Özeti
                </div>
                {stock.aiSummaryText ? (
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6' }}>
                    {stock.aiSummaryText}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>RSI:</span> <strong style={{ color: '#0f172a' }}>{stock.aiSummary.rsi.toFixed(1)}</strong> ({stock.aiSummary.rsi_status})
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Volatilite:</span> <strong style={{ color: '#0f172a' }}>%{stock.aiSummary.volatility_7d.toFixed(1)}</strong> ({stock.aiSummary.volatility_trend})
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Hacim Değişim:</span> <strong style={{ color: stock.aiSummary.volume_change > 0 ? '#10b981' : '#ef4444' }}>%{stock.aiSummary.volume_change > 0 ? '+' : ''}{stock.aiSummary.volume_change.toFixed(1)}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Korelasyon:</span> <strong style={{ color: '#0f172a' }}>{stock.aiSummary.correlation_top_stock}</strong> %{(stock.aiSummary.correlation_value * 100).toFixed(0)}
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Sentiment:</span> <strong style={{ color: '#0f172a' }}>%{stock.aiSummary.sentiment_score.toFixed(0)}</strong> pozitif
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>7 Gün:</span> <strong style={{ color: stock.aiSummary.price_change_7d > 0 ? '#10b981' : '#ef4444' }}>%{stock.aiSummary.price_change_7d > 0 ? '+' : ''}{stock.aiSummary.price_change_7d.toFixed(1)}</strong>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reasons */}
            <div style={{
              background: getSignalBg(stock.signal),
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#0f172a', marginBottom: '8px', textTransform: 'uppercase' }}>
                📊 Yükseliş Nedenleri
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px' }}>
                {stock.reasons.map((reason, idx) => (
                  <li key={idx} style={{ 
                    fontSize: '12px', 
                    color: '#475569', 
                    marginBottom: '4px',
                    lineHeight: '1.5'
                  }}>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer Stats */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#64748b'
            }}>
              <span>Hacim: {formatNumber(stock.volume24h)}</span>
              <span>Piy. Değ.: {formatNumber(stock.marketCap / 1000000)}M ₺</span>
            </div>
          </div>
        ))}
      </div>

      {/* News Panel */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📰 Piyasa Haberleri
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.news.map((news, idx) => (
            <div 
              key={idx}
              style={{
                padding: '12px',
                background: news.impact === 'positive' ? 'rgba(16,185,129,0.1)' : 
                           news.impact === 'negative' ? 'rgba(239,68,68,0.1)' : 
                           'rgba(100,116,139,0.1)',
                borderRadius: '8px',
                borderLeft: '3px solid ' + (
                  news.impact === 'positive' ? '#10b981' : 
                  news.impact === 'negative' ? '#ef4444' : 
                  '#64748b'
                )
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                {news.title}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{news.time} saat önce</span>
                <span style={{
                  padding: '2px 8px',
                  background: news.impact === 'positive' ? '#10b98120' : 
                             news.impact === 'negative' ? '#ef444420' : 
                             '#64748b20',
                  color: news.impact === 'positive' ? '#10b981' : 
                        news.impact === 'negative' ? '#ef4444' : 
                        '#64748b',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  {news.impact === 'positive' ? 'Pozitif' : news.impact === 'negative' ? 'Negatif' : 'Nötr'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

