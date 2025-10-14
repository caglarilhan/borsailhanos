'use client';

import { useState, useEffect } from 'react';
import { 
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/react/24/outline';

interface Alert {
  id: string;
  type: 'BUY' | 'SELL' | 'BREAKOUT' | 'DIVERGENCE' | 'VOLUME_SPIKE' | 'NEWS';
  symbol: string;
  message: string;
  price: number;
  target?: number;
  stopLoss?: number;
  confidence: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
  isRead: boolean;
  soundEnabled: boolean;
}

interface RealTimeAlertsProps {
  isLoading?: boolean;
}

export default function RealTimeAlerts({ isLoading }: RealTimeAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high_priority'>('all');

  useEffect(() => {
    // Mock real-time alerts
    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'BUY',
        symbol: 'THYAO',
        message: 'Güçlü yükseliş sinyali! RSI oversold ve MACD pozitif kesişim.',
        price: 325.50,
        target: 340.75,
        stopLoss: 315.25,
        confidence: 0.92,
        priority: 'HIGH',
        timestamp: new Date().toISOString(),
        isRead: false,
        soundEnabled: true
      },
      {
        id: '2',
        type: 'BREAKOUT',
        symbol: 'TUPRS',
        message: 'Üçgen formasyonu kırılımı! Yüksek hacim ile destekleniyor.',
        price: 145.20,
        target: 158.50,
        stopLoss: 140.80,
        confidence: 0.95,
        priority: 'CRITICAL',
        timestamp: new Date(Date.now() - 30000).toISOString(),
        isRead: false,
        soundEnabled: true
      },
      {
        id: '3',
        type: 'VOLUME_SPIKE',
        symbol: 'ASELS',
        message: 'Anormal hacim artışı tespit edildi. Dikkat!',
        price: 88.40,
        confidence: 0.78,
        priority: 'MEDIUM',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        isRead: true,
        soundEnabled: true
      },
      {
        id: '4',
        type: 'NEWS',
        symbol: 'SISE',
        message: 'Pozitif haber: Yeni proje anlaşması imzalandı.',
        price: 45.80,
        confidence: 0.65,
        priority: 'MEDIUM',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        isRead: true,
        soundEnabled: true
      }
    ];

    setTimeout(() => {
      setAlerts(mockAlerts);
    }, 500);

    // Simulate new alerts
    const interval = setInterval(() => {
      const newAlert: Alert = {
        id: Date.now().toString(),
        type: ['BUY', 'SELL', 'BREAKOUT'][Math.floor(Math.random() * 3)] as any,
        symbol: ['THYAO', 'ASELS', 'TUPRS', 'SISE', 'EREGL'][Math.floor(Math.random() * 5)],
        message: 'Yeni sinyal tespit edildi!',
        price: Math.random() * 100 + 50,
        confidence: Math.random() * 0.4 + 0.6,
        priority: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)] as any,
        timestamp: new Date().toISOString(),
        isRead: false,
        soundEnabled: true
      };
      
      setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
      
      if (soundEnabled) {
        // Play notification sound
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7bllHgU6k9n1unEiBC13yO/eizEIHWq+8+OWT');
        audio.play().catch(() => {});
      }
    }, 15000); // New alert every 15 seconds

    return () => clearInterval(interval);
  }, [soundEnabled]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'BUY': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'SELL': return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'BREAKOUT': return <ExclamationTriangleIcon className="h-5 w-5 text-blue-500" />;
      case 'VOLUME_SPIKE': return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      case 'NEWS': return <BellIcon className="h-5 w-5 text-purple-500" />;
      default: return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.isRead;
    if (filter === 'high_priority') return alert.priority === 'HIGH' || alert.priority === 'CRITICAL';
    return true;
  });

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Gerçek Zamanlı Uyarılar</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-300 rounded"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-48"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BellIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">Gerçek Zamanlı Uyarılar</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                {unreadCount} Yeni
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                soundEnabled ? 'text-green-600 bg-green-100' : 'text-gray-400 bg-gray-100'
              }`}
              title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
            >
              {soundEnabled ? (
                <SpeakerWaveIcon className="h-5 w-5" />
              ) : (
                <SpeakerXMarkIcon className="h-5 w-5" />
              )}
            </button>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-3 py-1"
            >
              <option value="all">Tüm Uyarılar</option>
              <option value="unread">Okunmamış</option>
              <option value="high_priority">Yüksek Öncelik</option>
            </select>
            <button
              onClick={markAllAsRead}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Tümünü Okundu İşaretle
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`border rounded-lg p-4 transition-all ${
                !alert.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
              } ${getPriorityColor(alert.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <p className="font-semibold text-gray-900">{alert.symbol}</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(alert.priority)}`}>
                        {alert.priority}
                      </span>
                      {!alert.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Fiyat: ₺{alert.price.toFixed(2)}</span>
                      {alert.target && <span>Hedef: ₺{alert.target.toFixed(2)}</span>}
                      {alert.stopLoss && <span>Stop: ₺{alert.stopLoss.toFixed(2)}</span>}
                      <span>Güven: {(alert.confidence * 100).toFixed(0)}%</span>
                      <span>{new Date(alert.timestamp).toLocaleTimeString('tr-TR')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!alert.isRead && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Okundu
                    </button>
                  )}
                  <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                    Takip Et
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredAlerts.length === 0 && (
          <div className="text-center py-8">
            <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Henüz uyarı yok</p>
          </div>
        )}
      </div>
    </div>
  );
}
