'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/config';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface SystemHealth {
  backend: 'healthy' | 'degraded' | 'down';
  api_latency: number;
  active_endpoints: number;
  last_update: string;
}

export default function SystemHealthPanel() {
  const [health, setHealth] = useState<SystemHealth>({
    backend: 'down',
    api_latency: 0,
    active_endpoints: 0,
    last_update: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      const startTime = Date.now();
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const latency = Date.now() - startTime;
        
        if (response.ok) {
          const data = await response.json();
          setHealth({
            backend: data.status === 'healthy' ? 'healthy' : 'degraded',
            api_latency: latency,
            active_endpoints: 60,
            last_update: new Date().toISOString()
          });
        } else {
          setHealth(prev => ({ ...prev, backend: 'degraded' }));
        }
      } catch (error) {
        console.error('Health check failed:', error);
        setHealth(prev => ({ ...prev, backend: 'down' }));
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // 30 saniyede bir kontrol

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      default:
        return 'bg-red-50 border-red-200 text-red-700';
    }
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return 'text-green-600';
    if (latency < 300) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Sistem Durumu</h3>
      </div>
      <div className="p-6 space-y-4">
        {/* Backend Status */}
        <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(health.backend)}`}>
          <div className="flex items-center gap-3">
            {getStatusIcon(health.backend)}
            <div>
              <div className="font-medium">Backend API</div>
              <div className="text-sm opacity-75">
                {health.backend === 'healthy' ? 'Çalışıyor' : health.backend === 'degraded' ? 'Yavaş' : 'Bağlantı Yok'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`font-bold ${getLatencyColor(health.api_latency)}`}>
              {health.api_latency}ms
            </div>
            <div className="text-xs opacity-75">Latency</div>
          </div>
        </div>

        {/* Active Endpoints */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div>
            <div className="font-medium text-blue-700">Aktif Endpoint'ler</div>
            <div className="text-sm text-blue-600">API servisleri</div>
          </div>
          <div className="text-2xl font-bold text-blue-700">{health.active_endpoints}+</div>
        </div>

        {/* Last Update */}
        <div className="text-xs text-gray-500 text-center">
          Son kontrol: {new Date(health.last_update).toLocaleTimeString('tr-TR')}
        </div>
      </div>
    </div>
  );
}
