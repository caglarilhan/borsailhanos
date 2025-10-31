'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BistSignals from '@/components/BistSignals';
import AdvancedVisualizationHub from '@/components/V60/AdvancedVisualizationHub';
import AIConfidenceBreakdown from '@/components/V60/AIConfidenceBreakdown';
import VolatilityModel from '@/components/V60/VolatilityModel';
import PortfolioOptimizer from '@/components/V50/PortfolioOptimizer';
import TraderGPT from '@/components/V60/TraderGPT';
import OptionsAnalysis from '@/components/OptionsAnalysis';
import PatternAnalysis from '@/components/PatternAnalysis';
import InvestorPanel from '@/components/V60/InvestorPanel';
import SectorHeatmap from '@/components/SectorHeatmap';
import TradingSignals from '@/components/TradingSignals';

function Title({ text }: { text: string }) {
  return (
    <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: '#0f172a' }}>{text}</h1>
  );
}

export default function FeaturePage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = (params?.slug || '').toLowerCase();
  const [activeTab, setActiveTab] = useState<string>('signals');

  // Tab navigation for viz/advanced pages
  const renderTabNavigation = (tabs: string[], defaultTab: string = 'signals') => {
    if (activeTab === '') setActiveTab(defaultTab);
    return (
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '8px'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              background: activeTab === tab ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.8)',
              color: activeTab === tab ? '#fff' : '#0f172a',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: activeTab === tab ? '0 4px 12px rgba(102,126,234,0.3)' : 'none'
            }}
          >
            {tab === 'signals' && '📈 Sinyaller'}
            {tab === 'sectors' && '🏭 Sektörler'}
            {tab === 'predictions' && '🤖 Tahminler'}
            {tab === 'accuracy' && '🎯 Doğruluk'}
          </button>
        ))}
      </div>
    );
  };

  // Helper: Get universe from slug
  const getUniverse = () => {
    if (slug === 'bist30') return 'BIST30';
    if (slug === 'bist100') return 'BIST100';
    if (slug === 'bist300') return 'BIST300';
    return 'ALL';
  };

  // Set universe on mount for BistSignals (if possible)
  React.useEffect(() => {
    if (slug === 'bist30' || slug === 'bist100' || slug === 'bist300') {
      // Try to set universe via localStorage or URL param
      let universeKey = 'BIST30';
      if (slug === 'bist100') universeKey = 'BIST100';
      else if (slug === 'bist300') universeKey = 'BIST300';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('bist_signals_universe', universeKey);
      }
    }
  }, [slug]);

  const content = useMemo(() => {
    // Map slug -> component composition
    if (slug === 'bist30' || slug === 'bist100' || slug === 'bist300') {
      const titleText = slug === 'bist30' ? 'BIST 30 AI Tahminleri' : 
                       slug === 'bist100' ? 'BIST 100 AI Tahminleri' : 
                       'BIST 300 AI Tahminleri';
      const indexText = slug === 'bist30' ? 'BIST 30' : 
                       slug === 'bist100' ? 'BIST 100' : 
                       'BIST 300';
      return (
        <>
          <Title text={titleText} />
          <div style={{ 
            padding: '12px', 
            background: 'rgba(102,126,234,0.1)', 
            borderRadius: '8px', 
            marginBottom: '16px',
            fontSize: '14px',
            color: '#475569'
          }}>
            💡 <strong>{indexText}</strong> hisseleri için AI destekli tahminler, sinyal güven oranları ve gerçek zamanlı analizler.
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <BistSignals forcedUniverse={slug === 'bist30' ? 'BIST30' : slug === 'bist100' ? 'BIST100' : 'BIST300'} allowedUniverses={[slug === 'bist30' ? 'BIST30' : slug === 'bist100' ? 'BIST100' : 'BIST300']} />
          </div>
        </>
      );
    }
    if (slug === 'signals') {
      return (
        <>
          <Title text="Sinyal Takip" />
          <div style={{ 
            padding: '12px', 
            background: 'rgba(16,185,129,0.08)', 
            borderRadius: '8px', 
            marginBottom: '16px',
            fontSize: '14px',
            color: '#0f172a'
          }}>
            📡 Gerçek zamanlı AI sinyalleri, filtreler ve %80+ doğruluk görünümü.
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <BistSignals />
          </div>
        </>
      );
    }
    if (slug === 'viz' || slug === 'advanced') {
      return (
        <>
          <Title text="Gelişmiş Analiz ve Grafikler" />
          <div style={{ height: 16 }} />
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '16px',
            padding: '24px',
            border: '2px solid rgba(139,92,246,0.3)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            minHeight: '600px'
          }}>
            <AdvancedVisualizationHub />
          </div>
        </>
      );
    }
    if (slug === 'data') {
      return (
        <>
          <Title text="BIST Veri Paneli" />
          <div style={{ height: 16 }} />
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <SectorHeatmap />
            <div style={{ height: 16 }} />
            <TradingSignals />
          </div>
        </>
      );
    }
    if (slug === 'anomaly') {
      return (
        <>
          <Title text="Anomali + Momentum Radar" />
          <div style={{ height: 16 }} />
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '16px',
            padding: '24px',
            border: '2px solid rgba(139,92,246,0.3)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            minHeight: '600px'
          }}>
            <AdvancedVisualizationHub />
          </div>
        </>
      );
    }
    if (slug === 'arbitrage') {
      return (
        <>
          <Title text="Arbitraj İpuçları" />
          <div style={{ height: 16 }} />
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <TradingSignals />
          </div>
        </>
      );
    }
    if (slug === 'xai' || slug === 'explain' || slug === 'aitahmin') {
      return (
        <>
          <Title text="AI Güven & Açıklamalar" />
          <div style={{ height: 16 }} />
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '16px',
            padding: '24px',
            border: '2px solid rgba(139,92,246,0.3)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            minHeight: '600px'
          }}>
            <AIConfidenceBreakdown />
          </div>
        </>
      );
    }
    if (slug === 'risk') {
      return (
        <>
          <Title text="Risk Motoru & Volatilite Modeli" />
          <div style={{ height: 16 }} />
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '16px',
            padding: '24px',
            border: '2px solid rgba(139,92,246,0.3)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            minHeight: '600px'
          }}>
            <VolatilityModel />
          </div>
        </>
      );
    }
    if (slug === 'portfolio') {
      return (
        <>
          <Title text="Portföy Optimizasyonu" />
          <div style={{ height: 16 }} />
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <PortfolioOptimizer />
          </div>
        </>
      );
    }
    if (slug === 'gpt') {
      return (
        <>
          <Title text="TraderGPT - AI Asistan" />
          <div style={{ height: 16 }} />
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '16px',
            padding: '24px',
            border: '2px solid rgba(139,92,246,0.3)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            minHeight: '600px'
          }}>
            <TraderGPT />
          </div>
        </>
      );
    }
    if (slug === 'options') {
      return (
        <>
          <Title text="Opsiyon Analizi & Greeks" />
          <div style={{ height: 16 }} />
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <OptionsAnalysis />
          </div>
        </>
      );
    }
    if (slug === 'patterns') {
      return (
        <>
          <Title text="Formasyon Analizi & Pattern Recognition" />
          <div style={{ height: 16 }} />
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <PatternAnalysis />
          </div>
        </>
      );
    }
    if (slug === 'investor') {
      return (
        <>
          <Title text="AI Yatırımcı Paneli" />
          <div style={{ height: 16 }} />
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <InvestorPanel />
          </div>
        </>
      );
    }
    return (
      <>
        <Title text="Özellik bulunamadı" />
        <div style={{ height: 16 }} />
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <p>Geçersiz özellik: {slug}</p>
          <button
            onClick={() => router.push('/')}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              background: '#667eea',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700'
            }}
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </>
    );
  }, [slug, activeTab, router]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #ffffff, #f0f9ff, #e0f2fe)', padding: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header with back button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', padding: '16px 0', borderBottom: '2px solid #e2e8f0' }}>
          <button
            onClick={() => {
              console.log('🔙 Ana sayfaya dönülüyor...');
              router.push('/');
            }}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)';
              e.currentTarget.style.transform = 'translateX(-4px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(102,126,234,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
              e.currentTarget.style.transform = 'translateX(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102,126,234,0.3)';
            }}
          >
            ← Ana Sayfaya Dön
          </button>
        </div>

        {/* Top metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Doğruluk', value: '87%', color: '#10b981' },
            { label: 'Aktif', value: '15', color: '#3b82f6' },
            { label: 'Risk', value: '3.2', color: '#f59e0b' },
            { label: 'Sinyal', value: '150+', color: '#8b5cf6' }
          ].map((m, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.95)',
              border: '2px solid ' + m.color + '30',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
            }}
            >
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>{m.label}</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>

        {content}

        {/* Enhanced Comments / News section - yalnızca index olmayan sayfalarda */}
        {!(slug === 'bist30' || slug === 'bist100' || slug === 'bist300') && (
          <>
            <div style={{ height: 24 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  💬 AI Yorumları
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    'Model güveni yüksek semboller (THYAO, AKBNK) ön plana çıktı. Risk-reward oranları olumlu.',
                    'Volatilite düşük seviyelerde; piyasa stabilitesi sürüyor. Gün içi momentum güçlü sektörlere işaret ediyor.',
                    'AI ensemble modellerde %87+ doğruluk oranı. Hacim artışı olan büyük hisselerde sinyal yoğunluğu var.'
                  ].map((comment, idx) => (
                    <div key={idx} style={{
                      padding: '12px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      borderLeft: '3px solid #667eea',
                      fontSize: '14px',
                      color: '#475569',
                      lineHeight: '1.6'
                    }}>
                      {comment}
                    </div>
                  ))}
                </div>
              </div>
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
                  {[
                    { title: 'BIST büyük hisselerde hacim artışı', time: '2 saat önce', impact: 'Pozitif' },
                    { title: 'Makro verilerde iyileşme; risk-on eğilimi', time: '4 saat önce', impact: 'Pozitif' },
                    { title: 'AI tahminlerinde doğruluk trendi pozitif', time: '1 gün önce', impact: 'Nötr' }
                  ].map((news, idx) => (
                    <div key={idx} style={{
                      padding: '12px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      borderLeft: '3px solid ' + (news.impact === 'Pozitif' ? '#10b981' : '#64748b'),
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                        {news.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{news.time}</span>
                        <span style={{
                          padding: '2px 8px',
                          background: news.impact === 'Pozitif' ? '#10b98120' : '#64748b20',
                          color: news.impact === 'Pozitif' ? '#10b981' : '#64748b',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {news.impact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


