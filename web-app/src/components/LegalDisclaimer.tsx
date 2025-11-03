/**
 * P5.2: Legal Disclaimer Banner
 * "Yatırım tavsiyesi değildir" etiketi
 */

'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export function LegalDisclaimer() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Check if dismissed
    const dismissedUntil = localStorage.getItem('disclaimer_dismissed_until');
    if (dismissedUntil && new Date(dismissedUntil) > new Date()) {
      setIsVisible(false);
      return;
    }
    setIsVisible(true);
  }, []);

  const handleDismiss = () => {
    if (typeof window === 'undefined') return;
    setIsVisible(false);
    // Show again after 24 hours
    const nextShow = new Date();
    nextShow.setHours(nextShow.getHours() + 24);
    localStorage.setItem('disclaimer_dismissed_until', nextShow.toISOString());
  };

  if (!isVisible) return null;

  return (
    <div className="bg-yellow-50 border-b-2 border-yellow-400 px-4 py-2 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-yellow-800">
          <span className="font-bold">⚠️ Yatırım Tavsiyesi Değildir</span>
          <span className="hidden md:inline">
            Bu uygulama yalnızca analiz ve eğitim amaçlıdır. Al/sat kararları tamamen kullanıcının kendi sorumluluğundadır.
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-yellow-700 hover:text-yellow-900 transition-colors"
          aria-label="Kapat"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

