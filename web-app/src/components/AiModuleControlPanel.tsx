'use client';

import React from 'react';
import { useAiModuleConfig } from '@/contexts/AiModuleConfigContext';
import type { AiModuleId } from '@/types/ai-module-config';

const MODULE_LABELS: Record<AiModuleId, { label: string; description: string }> = {
  traderGpt: { label: 'TraderGPT', description: 'AI asistan ve chat' },
  vizHub: { label: 'Viz Hub', description: 'Görselleştirme merkezi' },
  aiConfidence: { label: 'AI Confidence', description: 'Güven skorları' },
  cognitiveInsights: { label: 'Cognitive Insights', description: 'Bilişsel analizler' },
  riskGuard: { label: 'Risk Guard', description: 'Risk yönetimi' },
  metaModel: { label: 'Meta-Model Engine', description: 'Meta model motoru' },
  v5Suite: { label: 'V5 Enterprise', description: 'Enterprise özellikler' },
  gamification: { label: 'Gamification', description: 'Oyunlaştırma' },
  planlar: { label: 'Planlar', description: 'Abonelik planları' },
  strategyBuilder: { label: 'Strategy Builder', description: 'Strateji oluşturucu' },
  investorPanel: { label: 'Investor Panel', description: 'Yatırımcı paneli' },
  feedbackLoop: { label: 'Feedback Loop', description: 'Geri bildirim döngüsü' },
};

export function AiModuleControlPanel() {
  const { config, isEnabled, toggle, enableAll, disableAll, reset } = useAiModuleConfig();

  const enabledCount = Object.values(config).filter(Boolean).length;
  const totalCount = Object.keys(config).length;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">AI Modül Kontrol Merkezi</h2>
          <p className="text-sm text-slate-500 mt-1">
            {enabledCount} / {totalCount} modül aktif
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={enableAll}
            className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition"
          >
            Hepsini Aç
          </button>
          <button
            onClick={disableAll}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 rounded-md hover:bg-slate-100 transition"
          >
            Hepsini Kapat
          </button>
          <button
            onClick={reset}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 rounded-md hover:bg-slate-100 transition"
          >
            Sıfırla
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {(Object.keys(config) as AiModuleId[]).map((moduleId) => {
          const enabled = isEnabled(moduleId);
          const { label, description } = MODULE_LABELS[moduleId];

          return (
            <div
              key={moduleId}
              className={`p-4 rounded-lg border-2 transition ${
                enabled
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-slate-900">{label}</h3>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${
                        enabled
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {enabled ? 'AKTİF' : 'KAPALI'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{description}</p>
                </div>
                <button
                  onClick={() => toggle(moduleId)}
                  className={`ml-3 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    enabled ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={enabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

