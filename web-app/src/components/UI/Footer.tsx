/**
 * P5.2: Footer Component
 * Alt bilgiye kaynak ve zaman damgası ekle
 */

'use client';

import React from 'react';
import { useDynamicTimestamp } from '@/hooks/useDynamicTimestamp';
import { formatUTC3DateTime } from '@/lib/formatters';

export function Footer() {
  const dynamicTime = useDynamicTimestamp(new Date(), 60000); // Update every minute

  return (
    <footer className="mt-8 pt-4 pb-6 border-t border-slate-200 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Sprint 7: Güvenlik - Kaynak bilgisi */}
            <div>
              <strong>Kaynaklar:</strong> Borsa İstanbul (BIST), TCMB, BloombergHT, Dünya, AA
            </div>
            <div className="hidden sm:inline">•</div>
            {/* Sprint 7: Güvenlik - Güncelleme damgası */}
            <div>
              <strong>Son güncelleme:</strong> {dynamicTime.formattedDateTime} • UTC+3
            </div>
            <div className="hidden sm:inline">•</div>
            <div>
              <strong>Versiyon:</strong> {typeof window !== 'undefined' ? (window as any).__APP_VERSION__ || '1.0.0' : process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
            </div>
          </div>
          <div className="text-slate-500">
            ⚠️ Yatırım Tavsiyesi Değildir • Analiz ve eğitim amaçlıdır
          </div>
        </div>
      </div>
    </footer>
  );
}


