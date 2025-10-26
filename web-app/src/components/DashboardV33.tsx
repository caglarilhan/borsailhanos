"use client";

import React, { useState } from 'react';

export default function DashboardV33() {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const allFeatures = {
    signals: [
      'AI Sinyalleri', 'BIST 30 AI Tahminleri', 'BIST 100 AI Tahminleri', 
      'Gelişmiş Analiz', 'Sinyal Takip', 'Gelişmiş Grafikler', 
      'BIST Veri Paneli', 'Anomali+Momentum', 'Arbitraj İpuçları'
    ],
    analysis: [
      'Piyasa Analizi', 'Grafikler', 'Formasyon Analizi', 'Predictive Twin',
      'XAI Explain', 'Sektör Güç', 'Likidite Heatmap', 'Event-Driven AI',
      'Makro Ekonomik', 'Temel Analiz'
    ],
    operations: [
      'Gerçek Zamanlı Uyarılar', 'İzleme Listesi', 'Risk Engine', 'Scenario Simulator',
      'Portföy Optimizasyonu', 'Tick Inspector', 'Smart Notifications', 'Adaptive UI'
    ],
    advanced: [
      'AI Tahmin Motoru', 'Broker Entegrasyonu', 'Kripto Trading', 'Opsiyon Analizi',
      'Algo Trading', 'Gelişmiş AI', 'Kalibrasyon', 'Eğitim & Sosyal',
      'Doğruluk Optimizasyonu', 'Deep Learning', 'Ensemble Stratejileri', 'Piyasa Rejimi', 'God Mode'
    ],
  };

  const signals = [
    { symbol: 'THYAO', signal: 'BUY', price: 245.50, target: 268.30, change: 9.3, comment: 'Güçlü teknik formasyon ve pozitif momentum', accuracy: 89.2 },
    { symbol: 'TUPRS', signal: 'SELL', price: 180.30, target: 165.20, change: -8.4, comment: 'Direnç seviyesinde satış baskısı', accuracy: 76.5 },
    { symbol: 'ASELS', signal: 'HOLD', price: 48.20, target: 49.10, change: 1.9, comment: 'Piyasa belirsizliği - bekleme', accuracy: 81.3 },
    { symbol: 'EREGL', signal: 'BUY', price: 55.80, target: 62.40, change: 11.8, comment: 'Yükseliş formasyonu tespit edildi', accuracy: 88.7 },
    { symbol: 'SISE', signal: 'BUY', price: 32.50, target: 36.80, change: 13.2, comment: 'Ters başlı omuz formasyonu', accuracy: 91.5 },
    { symbol: 'GARAN', signal: 'BUY', price: 185.40, target: 228.20, change: 23.1, comment: 'Güçlü kırılım ve yukarı trend', accuracy: 92.3 },
    { symbol: 'AKBNK', signal: 'BUY', price: 162.80, target: 198.60, change: 22.0, comment: 'Pozitif hacim sinyalleri', accuracy: 91.8 },
  ];

  const metrics = [
    { label: 'Toplam Kâr', value: '₺125.000', change: '+12.5%', color: '#10b981' },
    { label: 'Aktif Sinyaller', value: '15', change: '+3 yeni', color: '#3b82f6' },
    { label: 'Doğruluk Oranı', value: '87.3%', change: '+2.1%', color: '#10b981' },
    { label: 'Risk Skoru', value: '3.2', change: '▼ Düşük', color: '#10b981' },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom, #ffffff, #f0f9ff, #e0f2fe)', 
      color: '#0f172a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Header */}
      <header style={{ 
        background: 'rgba(255,255,255,0.85)', 
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(6,182,212,0.3)', 
        padding: '24px 40px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 30px rgba(6,182,212,0.15)'
      }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '20px', boxShadow: '0 6px 30px rgba(6,182,212,0.4)' }}>AI</div>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 'bold', margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>BIST AI Smart Trader</h1>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>v4.0 Professional Edition</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ 
              padding: '12px 24px', 
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(6,182,212,0.4)',
              transition: 'all 0.2s'
            }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>Watchlist</button>
            <button style={{ 
              padding: '12px 24px', 
              background: '#000', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>Admin</button>
          </div>
        </div>
      </header>

      <main style={{ padding: '48px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '28px', marginBottom: '70px' }}>
          {metrics.map((m, idx) => (
            <div key={m.label} style={{ 
              background: 'rgba(255,255,255,0.75)', 
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(6,182,212,0.25)', 
              borderRadius: '20px', 
              padding: '36px',
              boxShadow: '0 10px 40px rgba(6,182,212,0.15)',
              transition: 'all 0.3s ease'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 16px 50px rgba(6,182,212,0.25)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(6,182,212,0.15)';
            }}>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px' }}>{m.label}</div>
              <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px', color: '#0f172a', lineHeight: '1.1' }}>{m.value}</div>
              <div style={{ fontSize: '15px', color: m.color, fontWeight: '800' }}>{m.change}</div>
            </div>
          ))}
        </div>

        {/* ALL FEATURES BY CATEGORY */}
        <div style={{ marginBottom: '70px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '48px', color: '#0f172a', letterSpacing: '-1px' }}>Tüm Özellikler</h2>
          
          {/* SINYALLER */}
          <div style={{ marginBottom: '60px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', paddingBottom: '16px', borderBottom: '4px solid #06b6d4', color: '#0f172a' }}>
              📊 SINYALLER <span style={{ fontSize: '18px', color: '#06b6d4', fontWeight: 'normal' }}>(9 özellik)</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {allFeatures.signals.map((f, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(255,255,255,0.8)', 
                  backdropFilter: 'blur(12px)',
                  border: '2px solid rgba(6,182,212,0.25)', 
                  borderRadius: '16px', 
                  padding: '28px', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 6px 20px rgba(6,182,212,0.08)'
                }} onMouseEnter={(e) => { 
                  setHoveredFeature(f);
                  e.currentTarget.style.borderColor = '#06b6d4'; 
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(6,182,212,0.25)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }} onMouseLeave={(e) => { 
                  setHoveredFeature(null);
                  e.currentTarget.style.borderColor = 'rgba(6,182,212,0.25)'; 
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(6,182,212,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '17px', color: '#0f172a', letterSpacing: '-0.3px' }}>{f}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ANALIZ */}
          <div style={{ marginBottom: '60px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', paddingBottom: '16px', borderBottom: '4px solid #3b82f6', color: '#0f172a' }}>
              📈 ANALIZ <span style={{ fontSize: '18px', color: '#3b82f6', fontWeight: 'normal' }}>(10 özellik)</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {allFeatures.analysis.map((f, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(255,255,255,0.8)', 
                  backdropFilter: 'blur(12px)',
                  border: '2px solid rgba(59,130,246,0.25)', 
                  borderRadius: '16px', 
                  padding: '28px', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 6px 20px rgba(59,130,246,0.08)'
                }} onMouseEnter={(e) => { 
                  setHoveredFeature(f);
                  e.currentTarget.style.borderColor = '#3b82f6'; 
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(59,130,246,0.25)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }} onMouseLeave={(e) => { 
                  setHoveredFeature(null);
                  e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'; 
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,130,246,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '17px', color: '#0f172a', letterSpacing: '-0.3px' }}>{f}</div>
                </div>
              ))}
            </div>
          </div>

          {/* OPERASYON */}
          <div style={{ marginBottom: '60px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', paddingBottom: '16px', borderBottom: '4px solid #10b981', color: '#0f172a' }}>
              🔧 OPERASYON <span style={{ fontSize: '18px', color: '#10b981', fontWeight: 'normal' }}>(8 özellik)</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {allFeatures.operations.map((f, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(255,255,255,0.8)', 
                  backdropFilter: 'blur(12px)',
                  border: '2px solid rgba(16,185,129,0.25)', 
                  borderRadius: '16px', 
                  padding: '28px', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 6px 20px rgba(16,185,129,0.08)'
                }} onMouseEnter={(e) => { 
                  setHoveredFeature(f);
                  e.currentTarget.style.borderColor = '#10b981'; 
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(16,185,129,0.25)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }} onMouseLeave={(e) => { 
                  setHoveredFeature(null);
                  e.currentTarget.style.borderColor = 'rgba(16,185,129,0.25)'; 
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '17px', color: '#0f172a', letterSpacing: '-0.3px' }}>{f}</div>
                </div>
              ))}
            </div>
          </div>

          {/* GELIŞMİŞ */}
          <div style={{ marginBottom: '60px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', paddingBottom: '16px', borderBottom: '4px solid #8b5cf6', color: '#0f172a' }}>
              ⚡ GELIŞMİŞ <span style={{ fontSize: '18px', color: '#8b5cf6', fontWeight: 'normal' }}>(13 özellik)</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {allFeatures.advanced.map((f, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(255,255,255,0.8)', 
                  backdropFilter: 'blur(12px)',
                  border: '2px solid rgba(139,92,246,0.25)', 
                  borderRadius: '16px', 
                  padding: '28px', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 6px 20px rgba(139,92,246,0.08)'
                }} onMouseEnter={(e) => { 
                  setHoveredFeature(f);
                  e.currentTarget.style.borderColor = '#8b5cf6'; 
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(139,92,246,0.25)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }} onMouseLeave={(e) => { 
                  setHoveredFeature(null);
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'; 
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(139,92,246,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '17px', color: '#0f172a', letterSpacing: '-0.3px' }}>{f}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Signals Table */}
        <div style={{ 
          background: 'rgba(255,255,255,0.8)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(6,182,212,0.3)', 
          borderRadius: '20px', 
          overflow: 'hidden',
          boxShadow: '0 10px 50px rgba(6,182,212,0.15)'
        }}>
          <div style={{ padding: '28px', borderBottom: '1px solid rgba(6,182,212,0.1)', background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(255,255,255,0.8))' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, marginBottom: '12px', color: '#0f172a', letterSpacing: '-0.5px' }}>AI Sinyalleri</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ 
                padding: '10px 20px', 
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '10px', 
                fontSize: '14px', 
                fontWeight: '700', 
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(6,182,212,0.4)',
                transition: 'all 0.2s'
              }}>Filtrele</button>
              <button style={{ 
                padding: '10px 20px', 
                background: '#fff', 
                color: '#000', 
                border: '2px solid rgba(6,182,212,0.3)', 
                borderRadius: '10px', 
                fontSize: '14px', 
                fontWeight: '700', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#06b6d4'; e.currentTarget.style.background = 'rgba(6,182,212,0.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'; e.currentTarget.style.background = '#fff'; }}>%80+ Doğruluk</button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'rgba(240,249,255,0.6)' }}>
                <tr>
                  <th style={{ padding: '24px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: '#64748b', borderBottom: '2px solid rgba(6,182,212,0.15)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sembol</th>
                  <th style={{ padding: '24px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: '#64748b', borderBottom: '2px solid rgba(6,182,212,0.15)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sinyal</th>
                  <th style={{ padding: '24px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: '#64748b', borderBottom: '2px solid rgba(6,182,212,0.15)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mevcut Fiyat</th>
                  <th style={{ padding: '24px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: '#64748b', borderBottom: '2px solid rgba(6,182,212,0.15)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Beklenen Fiyat</th>
                  <th style={{ padding: '24px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: '#64748b', borderBottom: '2px solid rgba(6,182,212,0.15)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Değişim</th>
                  <th style={{ padding: '24px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: '#64748b', borderBottom: '2px solid rgba(6,182,212,0.15)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Yorumu</th>
                  <th style={{ padding: '24px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: '#64748b', borderBottom: '2px solid rgba(6,182,212,0.15)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Doğruluk</th>
                </tr>
              </thead>
              <tbody>
                {signals.map((s, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(6,182,212,0.08)', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6,182,212,0.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}>
                    <td style={{ padding: '24px', fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>{s.symbol}</td>
                    <td style={{ padding: '24px' }}>
                      <span style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background: s.signal === 'BUY' ? 'linear-gradient(135deg, #dcfce7, #86efac)' : s.signal === 'SELL' ? 'linear-gradient(135deg, #fee2e2, #fca5a5)' : '#f3f4f6',
                        color: s.signal === 'BUY' ? '#16a34a' : s.signal === 'SELL' ? '#dc2626' : '#6b7280',
                        boxShadow: s.signal === 'BUY' ? '0 4px 12px rgba(22,163,74,0.3)' : s.signal === 'SELL' ? '0 4px 12px rgba(220,38,38,0.3)' : 'none'
                      }}>
                        {s.signal}
                      </span>
                    </td>
                    <td style={{ padding: '24px', fontSize: '16px', color: '#0f172a', fontWeight: '600' }}>₺{s.price.toFixed(2)}</td>
                    <td style={{ padding: '24px', fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>₺{s.target.toFixed(2)}</td>
                    <td style={{ padding: '24px', fontSize: '16px', fontWeight: 'bold', color: s.change > 0 ? '#10b981' : '#ef4444' }}>
                      {s.change > 0 ? '↑' : '↓'} {Math.abs(s.change)}%
                    </td>
                    <td style={{ padding: '24px', fontSize: '15px', color: '#64748b', fontStyle: 'italic', maxWidth: '300px' }}>{s.comment}</td>
                    <td style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '100px', height: '8px', background: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: `linear-gradient(90deg, #06b6d4, #3b82f6)`, width: `${s.accuracy}%`, transition: 'width 0.5s' }}></div>
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', minWidth: '45px' }}>{s.accuracy}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div style={{ 
          marginTop: '60px',
          background: 'rgba(255,255,255,0.8)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(6,182,212,0.3)', 
          borderRadius: '20px', 
          overflow: 'hidden',
          boxShadow: '0 10px 50px rgba(6,182,212,0.15)'
        }}>
          <div style={{ padding: '28px', borderBottom: '1px solid rgba(6,182,212,0.1)', background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(255,255,255,0.8))' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>AI Prediction Chart</h2>
            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>Gerçek zamanlı teknik analiz ve trend tahmini</div>
          </div>
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', color: '#64748b', marginBottom: '12px' }}>📊 Grafik Alanı</div>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>Chart.js veya Recharts ile entegre edilecek</div>
          </div>
        </div>
      </main>
    </div>
  );
}
