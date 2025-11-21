'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { isAdmin } from '@/lib/featureFlags';
import { getCurrentUser, isAdminUser } from '@/lib/admin-guard';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { MetricGrid } from '@/components/shared/MetricGrid';
import {
  getSystemMetrics,
  getUserStats,
  getModelLogs,
  getFeatureFlags,
} from '@/services/admin';

const tabs = [
  { id: 'system', label: 'System Metrics' },
  { id: 'users', label: 'User Stats' },
  { id: 'logs', label: 'Model Logs' },
  { id: 'flags', label: 'Feature Flags' },
];

export default function AdminPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('system');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedRole = localStorage.getItem('userRole') || 'user';
        setUserRole(storedRole);
        const user = getCurrentUser();
        if (isAdminUser(user) || isAdmin(storedRole)) {
          setIsAuthorized(true);
        } else {
          router.push('/');
        }
      } catch (error) {
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const systemQuery = useQuery({ queryKey: ['admin-system'], queryFn: getSystemMetrics });
  const userQuery = useQuery({ queryKey: ['admin-users'], queryFn: getUserStats });
  const logQuery = useQuery({ queryKey: ['admin-logs'], queryFn: getModelLogs });
  const flagQuery = useQuery({ queryKey: ['admin-flags'], queryFn: getFeatureFlags });

  if (isLoading) {
    return (
      <Card className="col-span-12 text-center" title="Yetki kontrol ediliyor">
        <div className="flex items-center justify-center gap-3 text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          Admin erişimi doğrulanıyor...
        </div>
      </Card>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const renderTab = () => {
    if (activeTab === 'system') {
      const metrics = systemQuery.data;
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Latency">
            <p className="text-2xl font-semibold text-slate-900">{metrics?.latency ?? '-'}ms</p>
          </Card>
          <Card title="API Success">
            <p className="text-2xl font-semibold text-slate-900">{metrics?.apiSuccess ?? '-'}%</p>
          </Card>
          <Card title="Model Version">
            <p className="text-xl font-semibold text-slate-900">{metrics?.modelVersion ?? '-'}</p>
          </Card>
          <Card title="Memory Usage">
            <p className="text-xl font-semibold text-slate-900">{metrics?.memoryUsage ?? '-'}</p>
          </Card>
          <Card title="Stale Queries">
            <p className="text-xl font-semibold text-slate-900">{metrics?.staleQueries ?? '-'}</p>
          </Card>
        </div>
      );
    }
    if (activeTab === 'users') {
      const stats = userQuery.data;
      const metricItems = [
        { label: 'Toplam Kullanıcı', value: stats?.totalUsers ?? '-' },
        { label: 'Aktif (24s)', value: stats?.dailyActive ?? '-' },
      ];
      return (
        <>
          <MetricGrid items={metricItems} columns={2} />
          <Card className="mt-4" title="En çok izlenen semboller">
            <ul className="space-y-2 text-sm text-slate-700">
              {stats?.topSymbols.map((item) => (
                <li key={item.symbol} className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{item.symbol}</span>
                  <span>{item.watchers}</span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      );
    }
    if (activeTab === 'logs') {
      return (
        <Card title="Model Logs">
          <div className="overflow-x-auto">
            <table className="min-w-[560px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Timestamp</th>
                  <th className="px-3 py-2">Input</th>
                  <th className="px-3 py-2">Cost</th>
                  <th className="px-3 py-2">Output</th>
                </tr>
              </thead>
              <tbody>
                {logQuery.data?.map((log) => (
                  <tr key={log.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-xs text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString('tr-TR')}
                    </td>
                    <td className="px-3 py-2">{log.inputLength}</td>
                    <td className="px-3 py-2">{log.reasoningCost}</td>
                    <td className="px-3 py-2">{log.outputSize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      );
    }
    if (activeTab === 'flags') {
      const flags = flagQuery.data;
      return (
        <Card title="Feature Flags">
          <div className="space-y-3 text-sm text-slate-700">
            {flags &&
              Object.entries(flags).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span>{key}</span>
                  <Badge text={value ? 'Enabled' : 'Disabled'} color={value ? 'green' : 'red'} />
                </div>
              ))}
          </div>
        </Card>
      );
    }
    return null;
  };

  return (
    <>
      <Card
        className="col-span-12"
        title="⚙️ Admin Paneli"
        subtitle="Product owner yetkileri"
        actions={
          <Badge
            text={`Rol: ${userRole ?? 'unknown'}`}
            variant="outline"
            color="blue"
          />
        }
      >
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-3 py-1 ${
                activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      <div className="col-span-12 space-y-4">{renderTab()}</div>
    </>
  );
}

