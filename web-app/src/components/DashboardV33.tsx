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
    { symbol: 'THYAO', signal: 'BUY', price: 245.50, target: 268.30, change: 9.3, comment: 'Güçlü teknik formasyon ve pozitif momentum' },
    { symbol: 'TUPRS', signal: 'SELL', price: 180.30, target: 165.20, change: -8.4, comment: 'Direnç seviyesinde satış baskısı' },
    { symbol: 'ASELS', signal: 'HOLD', price: 48.20, target: 49.10, change: 1.9, comment: 'Piyasa belirsizliği - bekleme' },
    { symbol: 'EREGL', signal: 'BUY', price: 55.80, target: 62.40, change: 11.8, comment: 'Yükseliş formasyonu tespit edildi' },
    { symbol: 'SISE', signal: 'BUY', price: 32.50, target: 36.80, change: 13.2, comment: 'Ters başlı omuz formasyonu' },
    { symbol: 'GARAN', signal: 'BUY', price: 185.40, target: 228.20, change: 23.1, comment: 'Güçlü kırılım ve yukarı trend' },
    { symbol: 'AKBNK', signal: 'BUY', price: 162.80, target: 198.60, change: 22.0, comment: 'Pozitif hacim sinyalleri' },
  ];

  const metrics = [
    { label: 'Toplam Kâr', value: '₺125.000', change: '+12.5%', color: '#4caf50' },
    { label: 'Aktif Sinyaller', value: '15', change: '+3 yeni', color: '#2196f3' },
    { label: 'Doğruluk Oranı', value: '87.3%', change: '+2.1%', color: '#4caf50' },
    { label: 'Risk Skoru', value: '3.2', change: '▼ Düşük', color: '#4caf50' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#000' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: '#fff', 
        borderBottom: '1px solid #e2e8f0', 
        padding: '20px 40px',
        position: 'sticky',
        top: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1600px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>BIST AI Smart Trader v4.0</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ padding: '10px 20px', backgroundColor: '#06b6d4', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Watchlist</button>
            <button style={{ padding: '10px 20px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Admin</button>
          </div>
        </div>
      </header>

      <main style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '50px' }}>
          {metrics.map((m) => (
            <div key={m.label} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px', fontWeight: '600' }}>{m.label}</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '4px' }}>{m.value}</div>
              <div style={{ fontSize: '13px', color: m.color, fontWeight: '600' }}>{m.change}</div>
            </div>
          ))}
        </div>

        {/* ALL FEATURES - BY CATEGORY */}
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '30px' }}>Tüm Özellikler</h2>
          
          {/* SINYALLER */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #06b6d4' }}>SINYALLER (9 özellik)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {allFeatures.signals.map((f, idx) => (
                <div key={idx} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#06b6d4'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(6,182,212,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a' }}>{f}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ANALIZ */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #3b82f6' }}>ANALIZ (10 özellik)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {allFeatures.analysis.map((f, idx) => (
                <div key={idx} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a' }}>{f}</div>
                </div>
              ))}
            </div>
          </div>

          {/* OPERASYON */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #10b981' }}>OPERASYON (8 özellik)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {allFeatures.operations.map((f, idx) => (
                <div key={idx} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a' }}>{f}</div>
                </div>
              ))}
            </div>
          </div>

          {/* GELIŞMİŞ */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #8b5cf6' }}>GELIŞMİŞ (13 özellik)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {allFeatures.advanced.map((f, idx) => (
                <div key={idx} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(139,92,246,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a' }}>{f}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Signals Table */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, marginBottom: '8px' }}>AI Sinyalleri</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ padding: '8px 16px', backgroundColor: '#06b6d4', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Filtrele</button>
              <button style={{ padding: '8px 16px', backgroundColor: '#fff', color: '#000', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>%80+ Doğruluk</button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>SEMBOL</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>SİNYAL</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>MEVCUT FİYAT</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>BEKLENEN FİYAT</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>DEĞİŞİM</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>AI YORUMU</th>
                </tr>
              </thead>
              <tbody>
                {signals.map((s, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}>
                    <td style={{ padding: '16px', fontWeight: 'bold', fontSize: '14px' }}>{s.symbol}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        backgroundColor: s.signal === 'BUY' ? '#dcfce7' : s.signal === 'SELL' ? '#fee2e2' : '#f3f4f6',
                        color: s.signal === 'BUY' ? '#16a34a' : s.signal === 'SELL' ? '#dc2626' : '#6b7280'
                      }}>
                        {s.signal}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px' }}>₺{s.price.toFixed(2)}</td>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: 'bold' }}>₺{s.target.toFixed(2)}</td>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: 'bold', color: s.change > 0 ? '#16a34a' : '#dc2626' }}>
                      {s.change > 0 ? '↑' : '↓'} {Math.abs(s.change)}%
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>{s.comment}</td>
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
