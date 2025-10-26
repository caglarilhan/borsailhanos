"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DashboardV33() {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const [visibleSignals, setVisibleSignals] = useState(5);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>(['THYAO', 'AKBNK']);
  
  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      setTimeout(() => {
        setLastUpdate(new Date());
        setIsRefreshing(false);
      }, 1000);
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Sample chart data (30 days)
  const chartData = Array.from({ length: 30 }, (_, i) => ({
    day: `Gün ${i + 1}`,
    actual: 240 + Math.random() * 20 - 10,
    predicted: 242 + i * 0.8 + Math.random() * 15 - 7,
    confidence: 85 + Math.random() * 10
  }));
  
  // Sector Heatmap Data
  const sectors = [
    { name: 'Sanayi', change: 2.3, color: '#10b981' },
    { name: 'Bankacılık', change: -1.4, color: '#ef4444' },
    { name: 'Teknoloji', change: 3.8, color: '#10b981' },
    { name: 'İnşaat', change: 1.2, color: '#10b981' },
    { name: 'Gıda', change: -0.8, color: '#ef4444' },
    { name: 'Otomotiv', change: 2.1, color: '#10b981' },
  ];

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
    { label: 'Toplam Kâr', value: '₺125.000', change: '+12.5%', color: '#10b981', icon: '💰', pulse: true },
    { label: 'Aktif Sinyaller', value: '15', change: '+3 yeni', color: '#3b82f6', icon: '🎯', pulse: true },
    { label: 'Doğruluk Oranı', value: '87.3%', change: '+2.1%', color: '#10b981', icon: '📊', pulse: false },
    { label: 'Risk Skoru', value: '3.2', change: '▼ Düşük', color: '#10b981', icon: '⚠️', pulse: false },
  ];

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
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
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '12px' }}>
                v4.1 Live Edition
                {isRefreshing ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#06b6d4' }}>
                    <div style={{ width: '8px', height: '8px', background: '#06b6d4', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
                    Güncelleniyor...
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                    <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
                    Canlı • {lastUpdate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginRight: '12px' }}>
              İzleme: {watchlist.join(', ')}
            </div>
            <button 
              style={{ 
                padding: '12px 24px', 
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(6,182,212,0.4)',
                transition: 'all 0.2s',
                outline: 'none'
              }} 
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} 
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              aria-label="İzleme listesini aç"
            >
              Watchlist
            </button>
            <button 
              style={{ 
                padding: '12px 24px', 
                background: '#000', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none'
              }} 
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} 
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              aria-label="Admin paneline git"
            >
              Admin
            </button>
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
              transition: 'all 0.3s ease',
              position: 'relative'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 16px 50px rgba(6,182,212,0.25)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(6,182,212,0.15)';
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px', lineHeight: '1' }}>{m.icon}</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px' }}>{m.label}</div>
              <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px', color: '#0f172a', lineHeight: '1.1', animation: m.pulse ? 'pulse 2s ease-in-out infinite' : 'none' }}>{m.value}</div>
              <div style={{ fontSize: '15px', color: m.color, fontWeight: '800' }}>{m.change}</div>
            </div>
          ))}
        </div>
        
        {/* Sector Heatmap */}
        <div style={{ 
          marginBottom: '70px',
          background: 'rgba(255,255,255,0.8)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(6,182,212,0.3)', 
          borderRadius: '20px', 
          overflow: 'hidden',
          boxShadow: '0 10px 50px rgba(6,182,212,0.15)'
        }}>
          <div style={{ padding: '28px', borderBottom: '1px solid rgba(6,182,212,0.1)', background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(255,255,255,0.8))' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, marginBottom: '12px', color: '#0f172a', letterSpacing: '-0.5px' }}>📊 Sektör Isı Haritası</h2>
            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>Piyasa geneli sektörel performans analizi</div>
          </div>
          <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {sectors.map((sector, idx) => (
              <div key={idx} style={{ 
                background: sector.change > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `2px solid ${sector.color}40`,
                borderRadius: '16px', 
                padding: '24px',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = `0 8px 30px ${sector.color}30`;
              }} onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#0f172a' }}>{sector.name}</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: sector.color, lineHeight: '1' }}>
                  {sector.change > 0 ? '↑' : '↓'} {Math.abs(sector.change)}%
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                  {sector.change > 0 ? 'Yükseliş trendi' : 'Düşüş trendi'}
                </div>
              </div>
            ))}
          </div>
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
              <button 
                style={{ 
                  padding: '10px 20px', 
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '10px', 
                  fontSize: '14px', 
                  fontWeight: '700', 
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(6,182,212,0.4)',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                aria-label="Sinyal filtrelerini aç"
              >
                Filtrele
              </button>
              <button 
                style={{ 
                  padding: '10px 20px', 
                  background: '#fff', 
                  color: '#000', 
                  border: '2px solid rgba(6,182,212,0.3)', 
                  borderRadius: '10px', 
                  fontSize: '14px', 
                  fontWeight: '700', 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none'
                }} 
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#06b6d4'; e.currentTarget.style.background = 'rgba(6,182,212,0.05)'; }} 
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'; e.currentTarget.style.background = '#fff'; }}
                aria-label="Yüzde 80 üstü doğruluk filtrele"
              >
                %80+ Doğruluk
              </button>
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
                {signals.slice(0, visibleSignals).map((s, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(6,182,212,0.08)', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6,182,212,0.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }} aria-label={`${s.symbol} - ${s.signal} sinyali, Fiyat: ₺${s.price.toFixed(2)}, Beklenen: ₺${s.target.toFixed(2)}`}>
                    <td style={{ padding: '24px', fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>{s.symbol}</td>
                    <td style={{ padding: '24px' }}>
                      <span style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background: s.signal === 'BUY' ? 'linear-gradient(135deg, #dcfce7, #86efac)' : s.signal === 'SELL' ? 'linear-gradient(135deg, #fee2e2, #fca5a5)' : '#f3f4f6',
                        color: s.signal === 'BUY' ? '#16a34a' : s.signal === 'SELL' ? '#dc2626' : '#6b7280',
                        boxShadow: s.signal === 'BUY' ? '0 4px 12px rgba(22,163,74,0.3)' : s.signal === 'SELL' ? '0 4px 12px rgba(220,38,38,0.3)' : 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }} aria-label={`Sinyal tipi: ${s.signal}`}>
                        <span>{s.signal === 'BUY' ? '🟢' : s.signal === 'SELL' ? '🔴' : '🟡'}</span>
                        {s.signal}
                      </span>
                    </td>
                    <td style={{ padding: '24px', fontSize: '16px', color: '#0f172a', fontWeight: '600' }} aria-label={`Mevcut fiyat: ₺${s.price.toFixed(2)}`}>₺{s.price.toFixed(2)}</td>
                    <td style={{ padding: '24px', fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }} aria-label={`Beklenen fiyat: ₺${s.target.toFixed(2)}`}>₺{s.target.toFixed(2)}</td>
                    <td style={{ padding: '24px', fontSize: '16px', fontWeight: 'bold', color: s.change > 0 ? '#10b981' : '#ef4444' }} aria-label={`Fiyat değişimi: ${s.change > 0 ? 'artış' : 'düşüş'} %${Math.abs(s.change)}`}>
                      {s.change > 0 ? '↑' : '↓'} {Math.abs(s.change)}%
                    </td>
                    <td style={{ padding: '24px', fontSize: '15px', color: '#64748b', fontStyle: 'italic', maxWidth: '300px' }}>{s.comment}</td>
                    <td style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '100px', height: '8px', background: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' }} role="progressbar" aria-valuenow={s.accuracy} aria-valuemin={0} aria-valuemax={100}>
                          <div style={{ height: '100%', background: `linear-gradient(90deg, #06b6d4, #3b82f6)`, width: `${s.accuracy}%`, transition: 'width 0.5s' }}></div>
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', minWidth: '45px' }} aria-label={`Doğruluk oranı: ${s.accuracy} yüzde`}>{s.accuracy}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {signals.length > visibleSignals && (
            <div style={{ padding: '24px', borderTop: '1px solid rgba(6,182,212,0.1)', background: 'rgba(255,255,255,0.5)', display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={() => setVisibleSignals(signals.length)}
                style={{ 
                  padding: '12px 32px', 
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '10px',
                  fontSize: '14px', 
                  fontWeight: '700', 
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(6,182,212,0.4)',
                  transition: 'all 0.2s',
                  outline: 'none'
                }} 
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(6,182,212,0.5)'; }} 
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(6,182,212,0.4)'; }}
                aria-label={`${signals.length - visibleSignals} sinyal daha göster`}
              >
                {signals.length - visibleSignals} Daha Fazla Sinyal Göster
              </button>
            </div>
          )}
        </div>

        {/* AI Prediction Chart */}
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
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>AI Prediction Chart</h2>
            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '24px' }}>
              <span>Gerçek zamanlı teknik analiz ve trend tahmini</span>
              <span style={{ padding: '6px 14px', background: 'rgba(6,182,212,0.15)', borderRadius: '20px', fontSize: '12px', fontWeight: '700', color: '#06b6d4' }}>THYAO - 30 Günlük Trend</span>
            </div>
          </div>
          <div style={{ padding: '40px', aspectRatio: '16/9' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="day" 
                  stroke="#64748b" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fontSize: 12 }}
                  domain={['auto', 'auto']}
                  label={{ value: 'Fiyat (₺)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#64748b', fontSize: '13px', fontWeight: '600' } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(255,255,255,0.95)', 
                    border: '1px solid rgba(6,182,212,0.3)', 
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 10px 40px rgba(6,182,212,0.2)'
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}
                  itemStyle={{ fontSize: '14px', color: '#64748b' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }}
                  iconType="line"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                  name="Gerçek Fiyat"
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ fill: '#06b6d4', strokeWidth: 2, r: 5 }}
                  name="AI Tahmini"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ padding: '20px 40px', borderTop: '1px solid rgba(6,182,212,0.1)', background: 'rgba(6,182,212,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              <span style={{ fontWeight: '700', color: '#06b6d4' }}>Ortalama Doğruluk:</span> 87.3%
            </div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              <span style={{ fontWeight: '700', color: '#10b981' }}>Son Tahmin:</span> ₺268.30 <span style={{ color: '#10b981' }}>(+9.3%)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}
