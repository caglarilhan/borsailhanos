'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, AlertTriangle, CheckCircle } from 'lucide-react';

export default function RealtimeAlerts() {
  const alerts = [
    {
      id: '1',
      type: 'warning',
      message: 'TUPRS tahmini doğruluk oranı %70 altına düştü.',
      timestamp: new Date(Date.now() - 5 * 60000)
    },
    {
      id: '2',
      type: 'success',
      message: 'EREGL hedef fiyatına ulaştı: ₺62.40',
      timestamp: new Date(Date.now() - 12 * 60000)
    },
    {
      id: '3',
      type: 'info',
      message: 'THYAO\'da yeni alım sinyali: RSI 71, momentum güçlü',
      timestamp: new Date(Date.now() - 25 * 60000)
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'info': return <Zap className="w-5 h-5 text-cyan-400" />;
      default: return null;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'success': return 'bg-green-500/10 border-green-500/30';
      case 'info': return 'bg-cyan-500/10 border-cyan-500/30';
      default: return 'bg-slate-700/30 border-slate-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <Zap className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-bold text-white">⚡ Gerçek Zamanlı Uyarılar</h3>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, idx) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-4 rounded-lg border-2 ${getColor(alert.type)} flex items-start gap-3`}
          >
            {getIcon(alert.type)}
            <div className="flex-1">
              <p className="text-sm text-gray-300">{alert.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)} dakika önce
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

