/**
 * P5.2: Demo/Live Watermark Komponenti
 * Demo modunda su işareti gösterir, canlıda otomatik gizlenir
 */

'use client';

import React from 'react';
import { useIsDemo } from '@/hooks/useMetrics';

export function DemoWatermark() {
  const isDemo = useIsDemo();
  
  if (!isDemo) {
    return null; // Canlıda otomatik gizlenir
  }
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-7xl mx-auto px-3 pt-2">
        <div className="bg-yellow-500/90 backdrop-blur-sm rounded-b-lg px-3 py-1.5 text-xs font-semibold text-yellow-900 shadow-md border-b-2 border-yellow-600 flex items-center justify-center gap-2">
          <span>💧</span>
          <span>Demo Mode / Mock API v5.2</span>
          <span className="text-[10px] opacity-80">Yatırım tavsiyesi değildir</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline watermark (for embedded use)
 */
export function InlineDemoBadge({ className = '' }: { className?: string }) {
  const isDemo = useIsDemo();
  
  if (!isDemo) {
    return null;
  }
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300 ${className}`}>
      <span>💧</span>
      <span>Demo</span>
    </span>
  );
}


