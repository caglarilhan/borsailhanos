'use client';
import React from 'react';
import dynamic from 'next/dynamic';

const DriftGraph = dynamic(() => import('@/components/AI/DriftGraph').then(m=>m.DriftGraph), { ssr: false });
const SentimentTrend = dynamic(() => import('@/components/AI/SentimentTrend').then(m=>m.SentimentTrend), { ssr: false });
const LearningModePanel = dynamic(() => import('@/components/AI/LearningModePanel').then(m=>m.LearningModePanel), { ssr: false });
const ModelVersionHistory = dynamic(() => import('@/components/AI/ModelVersionHistory').then(m=>m.ModelVersionHistory), { ssr: false });
const CorrelationHeatmap = dynamic(() => import('@/components/AI/CorrelationHeatmap').then(m=>m.CorrelationHeatmap), { ssr: false });

export default function AIChartsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-900">🧠 AI Grafik Merkezi</h1>
        <a href="/" className="text-xs underline text-slate-600">Ana sayfaya dön</a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-3 shadow-sm">
          <div className="text-xs font-semibold text-slate-700 mb-2">Model Drift / Kalibrasyon</div>
          <DriftGraph />
        </div>

        <div className="bg-white rounded-lg border p-3 shadow-sm">
          <div className="text-xs font-semibold text-slate-700 mb-2">FinBERT Sentiment Trend (7g)</div>
          <SentimentTrend />
        </div>

        <div className="bg-white rounded-lg border p-3 shadow-sm">
          <div className="text-xs font-semibold text-slate-700 mb-2">AI Learning Mode</div>
          <LearningModePanel />
        </div>

        <div className="bg-white rounded-lg border p-3 shadow-sm">
          <div className="text-xs font-semibold text-slate-700 mb-2">Model Versiyon Geçmişi</div>
          <ModelVersionHistory />
        </div>

        <div className="bg-white rounded-lg border p-3 shadow-sm lg:col-span-2">
          <div className="text-xs font-semibold text-slate-700 mb-2">Korelasyon Heatmap</div>
          <CorrelationHeatmap />
        </div>
      </div>
    </div>
  );
}


