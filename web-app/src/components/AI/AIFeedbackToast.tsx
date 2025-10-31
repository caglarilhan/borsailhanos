'use client';

import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

export function AIFeedbackToast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === 'success' ? 'bg-emerald-500' : type === 'warning' ? 'bg-amber-500' : 'bg-blue-500';

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 fade-in">
      <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 min-w-[300px] max-w-md`}>
        <span className="text-lg">✓</span>
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-auto text-white/80 hover:text-white text-lg leading-none">×</button>
      </div>
    </div>
  );
}

