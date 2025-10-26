"use client";

import React, { useState } from 'react';

export default function DashboardV33() {
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
      background: 'linear-gradient(to bottom, #ffffff, #f0f9ff)', 
      color: '#0f172a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Header */}
      <header style={{ 
        background: 'rgba(255,255,255,0.8)', 
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(6,182,212,0.2)', 
        padding: '20px 40px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(6,182,212,0.1)'
      }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', boxShadow: '0 4px 20px rgba(6,182,212,0.3)' }}>AI</div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>BIST AI Smart Trader</h1>
              <div style={{ fontSize: '12px', color: '#64748b' }}>v4.0 Professional</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ 
              padding: '10px 20px', 
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(6,182,212,0.3)',
              transition: 'all 0.2s'
            }}>Watchlist</button>
            <button style={{ 
              padding: '10px 20px', 
              background: '#000', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer'
            }}>Admin</button>
          </div>
        </div>
      </header>

      <main style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '60px' }}>
          {metrics.map((m) => (
            <div key={m.label} style={{ 
              background: 'rgba(255,255,255,0.7)', 
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(6,182,212,0.2)', 
              borderRadius: '16px', 
              padding: '32px',
              boxShadow: '0 8px 32px rgba(6,182,212,0.1)',
              transition: 'all 0.3s'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(6,182,212,0.2)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(6,182,212,0.1)';
            }}>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.label}</div>
              <div style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '8px', color: '#0f172a' }}>{m.value}</div>
              <div style={{ fontSize: '14px', color: m.color, fontWeight: '700' }}>{m.change}</div>
            </div>
          ))}
        </div>

        {/* ALL FEATURES BY CATEGORY */}
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '40px', color: '#0f172a' }}>Tüm Özellikler</h2>
          
          {/* SINYALLER */}
          <div style={{ marginBottom: '50px' }}>
            <div style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', paddingBottom: '12px', borderBottom: '3px solid #06b6d4', color: '#0f172a' }}>
              📊 SINYALLER (9 özellik)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {allFeatures.signals.map((f, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(255,255,255,0.8)', 
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(6,182,212,0.2)', 
                  borderRadius: '12px', 
                  padding: '24px', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(6,182,212,0.05)'
                }} onMouseEnter={(e) => { 
                  e.currentTarget.style.borderColor = '#06b6d4'; 
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(6,182,212,0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }} onMouseLeave={(e) => { 
                  e.currentTarget.style.borderColor = 'rgba(6,182,212,0.2)'; 
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(6,182,212,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>{f}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ANALIZ */}
          <div style={{ marginBottom: '50px' }}>
            <div style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', paddingBottom: '12px', borderBottom: '3px solid #3b82f6', color: '#0f172a' }}>
              📈 ANALIZ (10 özellik)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {allFeatures.analysis.map((f, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(255,255,255,0.8)', 
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(59,130,246,0.2)', 
                  borderRadius: '12px', 
                  padding: '24px', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(59,130,246,0.05)'
                }} onMouseEnter={(e) => { 
                  e.currentTarget.style.borderColor = '#3b82f6'; 
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,130,246,0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }} onMouseLeave={(e) => { 
                  e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)'; 
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>{f}</div>
                </div>
              ))}
            </div>
          </div>

          {/* OPERASYON */}
          <div style={{ marginBottom: '50px' }}>
            <div style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', paddingBottom: '12px', borderBottom: '3px solid #10b981', color: '#0f172a' }}>
              🔧 OPERASYON (8 özellik)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {allFeatures.operations.map((f, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(255,255,255,0.8)', 
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(16,185,129,0.2)', 
                  borderRadius: '12px', 
                  padding: '24px', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.05)'
                }} onMouseEnter={(e) => { 
                  e.currentTarget.style.borderColor = '#10b981'; 
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }} onMouseLeave={(e) => { 
                  e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)'; 
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>{f}</div>
                </div>
              ))}
            </div>
          </div>

          {/* GELIŞMİŞ */}
          <div style={{ marginBottom: '50px' }}>
            <div style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', paddingBottom: '12px', borderBottom: '3px solid #8b5cf6', color: '#0f172a' }}>
              ⚡ GELIŞMİŞ (13 özellik)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {allFeatures.advanced.map((f, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(255,255,255,0.8)', 
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(139,92,246,0.2)', 
                  borderRadius: '12px', 
                  padding: '24px', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(139,92,246,0.05)'
                }} onMouseEnter={(e) => { 
                  e.currentTarget.style.borderColor = '#8b5cf6'; 
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(139,92,246,0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }} onMouseLeave={(e) => { 
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'; 
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(139,92,246,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>{f}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Signals Table */}
        <div style={{ 
          background: 'rgba(255,255,255,0.8)', 
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(6,182,212,0.2)', 
          borderRadius: '16px', 
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(6,182,212,0.1)'
        }}>
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(6,182,212,0.1)', background: 'linear-gradient(135deg, rgba(6,182,212,0.1), #fff)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, marginBottom: '8px', color: '#0f172a' }}>AI Sinyalleri</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ 
                padding: '8px 16px', 
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '13px', 
                fontWeight: '600', 
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(6,182,212,0.3)'
              }}>Filtrele</button>
              <button style={{ 
                padding: '8px 16px', 
                background: '#fff', 
                color: '#000', 
                border: '1px solid rgba(6,182,212,0.2)', 
                borderRadius: '8px', 
                fontSize: '13px', 
                fontWeight: '600', 
                cursor: 'pointer'
              }}>%80+ Doğruluk</button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'rgba(240,249,255,0.5)' }}>
                <tr>
                  <th style={{ padding: '20px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: '#64748b', borderBottom: '2px solid rgba(6,182,212,0.1)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sembol</th>
                  <th style={{ padding: '20px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: '#64748b', borderBottom: '2px solid rgba(6,182,212,0.1)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sinyal</th>
                  <th style={{ padding: '20px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: '#64748b', borderBottom: '2px solid rgba(6,182,212,0.1)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mevcut Fiyat</th>
                  <th style={{ padding: '20px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: '#64748b', borderBottom: '2px solid rgba(6,182,212,0.1)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Beklenen Fiyat</th>
                  <th style={{ padding: '20px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: '#64748b', borderBottom: '2px solid rgba(6,182,212,0.1)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Değişim</th>
                  <th style={{ padding: '20px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: '#64748b', borderBottom: '2px solid rgba(6,182,212,0.1)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Yorumu</th>
                  <th style={{ padding: '20px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: '#64748b', borderBottom: '2px solid rgba(6,182,212,0.1)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Doğruluk</th>
                </tr>
              </thead>
              <tbody>
                {signals.map((s, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(6,182,212,0.05)', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(240,249,255,0.5)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}>
                    <td style={{ padding: '20px', fontWeight: 'bold', fontSize: '15px', color: '#0f172a' }}>{s.symbol}</td>
                    <td style={{ padding: '20px' }}>
                      <span style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background: s.signal === 'BUY' ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' : s.signal === 'SELL' ? 'linear-gradient(135deg, #fee2e2, #fecaca)' : '#f3f4f6',
                        color: s.signal === 'BUY' ? '#16a34a' : s.signal === 'SELL' ? '#dc2626' : '#6b7280',
                        boxShadow: s.signal === 'BUY' ? '0 2px 8px rgba(22,163,74,0.2)' : s.signal === 'SELL' ? '0 2px 8px rgba(220,38,38,0.2)' : 'none'
                      }}>
                        {s.signal}
                      </span>
                    </td>
                    <td style={{ padding: '20px', fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>₺{s.price.toFixed(2)}</td>
                    <td style={{ padding: '20px', fontSize: '15px', fontWeight: 'bold' }}>₺{s.target.toFixed(2)}</td>
                    <td style={{ padding: '20px', fontSize: '15px', fontWeight: 'bold', color: s.change > 0 ? '#10b981' : '#ef4444' }}>
                      {s.change > 0 ? '↑' : '↓'} {Math.abs(s.change)}%
                    </td>
                    <td style={{ padding: '20px', fontSize: '14px', color: '#64748b', fontStyle: 'italic' }}>{s.comment}</td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '80px', height: '6px', background: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: `linear-gradient(90deg, #06b6d4, #3b82f6)`, width: `${s.accuracy || 85}%`, transition: 'width 0.3s' }}></div>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>{s.accuracy}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
