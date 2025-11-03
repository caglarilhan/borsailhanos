/**
 * AI Explanation Modal
 * Sprint 2: Sinyal Sistemi - AI açıklama modal bileşeni
 * Modal yapısı ile AI açıklamalarını gösterir
 */

'use client';

import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface AIExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  prediction: number;
  confidence: number;
  explanation?: string;
}

export function AIExplanationModal({
  isOpen,
  onClose,
  symbol,
  prediction,
  confidence,
  explanation
}: AIExplanationModalProps) {
  if (!isOpen) return null;

  const getSignalColor = (conf: number) => {
    if (conf >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (conf >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getSignalLabel = (pred: number) => {
    if (pred > 0.05) return 'BUY';
    if (pred < -0.05) return 'SELL';
    return 'HOLD';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-w-2xl w-full bg-white rounded-lg border border-slate-200 shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xl">🧠</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">AI Sinyal Açıklaması</h2>
              <p className="text-sm text-slate-600">{symbol}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Kapat"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Signal Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-600 mb-1">Sinyal</div>
              <div className={`text-sm font-bold px-2 py-1 rounded inline-block border ${getSignalColor(confidence * 100)}`}>
                {getSignalLabel(prediction)}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-600 mb-1">Güven Skoru</div>
              <div className="text-lg font-bold text-slate-900">
                {(confidence * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-semibold text-blue-900 mb-2">AI Analizi</div>
            <div className="text-sm text-blue-800">
              {explanation || `AI modeli, ${symbol} için ${getSignalLabel(prediction)} sinyali üretti. Güven skoru ${(confidence * 100).toFixed(1)}% seviyesinde. Tahmin edilen fiyat değişimi: ${(prediction * 100).toFixed(2)}%.`}
            </div>
          </div>

          {/* Factors */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-sm font-semibold text-slate-900 mb-2">Etkileyen Faktörler</div>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span>RSI Değeri</span>
                <span className="font-semibold">Orta (45-55)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>MACD Momentum</span>
                <span className="font-semibold">
                  {prediction > 0 ? 'Yükseliş' : 'Düşüş'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Sentiment Skoru</span>
                <span className="font-semibold">
                  {confidence >= 0.8 ? 'Güçlü Pozitif' : confidence >= 0.7 ? 'Pozitif' : 'Nötr'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

