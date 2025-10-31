"use client";

import React, { useState } from 'react';

interface AnalysisData {
  investor: string;
  avatar: string;
  color: string;
  one_day: { direction: string; percentage: number; trend: string };
  three_day: { direction: string; percentage: number; trend: string };
  five_day: { direction: string; percentage: number; trend: string };
  ten_day: { direction: string; percentage: number; trend: string };
  comment: string;
  confidence: number;
  timestamp: string;
}

const INVESTORS = [
  { key: "buffett", label: "💎 Buffett", color: "bg-emerald-600", name: "Warren Buffett" },
  { key: "lynch", label: "🚀 Lynch", color: "bg-purple-600", name: "Peter Lynch" },
  { key: "dalio", label: "🌍 Dalio", color: "bg-blue-700", name: "Ray Dalio" },
  { key: "simons", label: "🧠 Simons", color: "bg-orange-600", name: "Jim Simons" },
  { key: "soros", label: "⚡ Soros", color: "bg-red-600", name: "George Soros" },
  { key: "wood", label: "🔮 Cathie Wood", color: "bg-pink-600", name: "Cathie Wood" },
  { key: "burry", label: "🕳️ Burry", color: "bg-gray-900", name: "Michael Burry" },
];

export default function InvestorPanel() {
  const [report, setReport] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>("");

  const handleAnalysis = async (mode: string) => {
    setLoading(true);
    setSelectedMode(mode);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:18085';
      const res = await fetch(`${base}/api/v60/analyze?mode=${mode}&symbol=THYAO`);
      const data = await res.json();
      setReport(data);
    } catch (error) {
      console.error('❌ Analysis error:', error);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      margin: '16px 0',
      padding: '24px',
      background: 'rgba(255,255,255,0.95)',
      borderRadius: '20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#0f172a', textAlign: 'center' }}>
        🎯 AI Yatırımcı Analizi
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
        gap: '10px',
        marginBottom: '20px' 
      }}>
        {INVESTORS.map((inv) => (
          <button
            key={inv.key}
            onClick={() => handleAnalysis(inv.key)}
            style={{
              padding: '12px 8px',
              background: selectedMode === inv.key ? inv.color : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
          >
            {inv.label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
          <div style={{ fontSize: '14px' }}>AI raporu hazırlanıyor...</div>
        </div>
      )}

      {report && !loading && (
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98))',
          color: '#fff',
          padding: '24px',
          borderRadius: '16px',
          border: `2px solid ${report.color}40`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '32px', marginRight: '12px' }}>{report.avatar}</div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                {report.investor} AI Raporu
              </h3>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                Güven Puanı: {report.confidence}% | {new Date(report.timestamp).toLocaleString('tr-TR')}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', marginBottom: '8px', color: '#94a3b8', fontWeight: '600' }}>📊 TAHMIN ARALIĞI</div>
            <div style={{ display: 'grid', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>1 Günlük:</span>
                <span style={{ color: report.one_day.percentage > 0 ? '#10b981' : '#ef4444' }}>
                  {report.one_day.trend} {report.one_day.direction} | {report.one_day.percentage > 0 ? '+' : ''}{report.one_day.percentage}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>3 Günlük:</span>
                <span style={{ color: report.three_day.percentage > 0 ? '#10b981' : '#ef4444' }}>
                  {report.three_day.trend} {report.three_day.direction} | {report.three_day.percentage > 0 ? '+' : ''}{report.three_day.percentage}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>5 Günlük:</span>
                <span style={{ color: report.five_day.percentage > 0 ? '#10b981' : '#ef4444' }}>
                  {report.five_day.trend} {report.five_day.direction} | {report.five_day.percentage > 0 ? '+' : ''}{report.five_day.percentage}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>10 Günlük:</span>
                <span style={{ color: report.ten_day.percentage > 0 ? '#10b981' : '#ef4444' }}>
                  {report.ten_day.trend} {report.ten_day.direction} | {report.ten_day.percentage > 0 ? '+' : ''}{report.ten_day.percentage}%
                </span>
              </div>
            </div>
          </div>

          <div style={{ 
            padding: '16px', 
            background: 'rgba(30,41,59,0.5)', 
            borderRadius: '12px',
            borderLeft: `4px solid ${report.color}`
          }}>
            <div style={{ fontSize: '13px', marginBottom: '8px', color: '#94a3b8', fontWeight: '600' }}>💬 YATIRIMCI YORUMU</div>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              "{report.comment}"
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

