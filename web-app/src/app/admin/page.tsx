'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdmin } from '@/lib/featureFlags';

export default function AdminPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Auth check (gerçek implementasyonda backend'den gelecek)
    const checkAuth = async () => {
      try {
        // Mock: localStorage'dan role al (gerçek implementasyonda backend auth check)
        const storedRole = localStorage.getItem('userRole') || 'user';
        setUserRole(storedRole);
        
        if (isAdmin(storedRole)) {
          setIsAuthorized(true);
        } else {
          // Unauthorized: redirect to home
          router.push('/');
        }
      } catch (error) {
        console.error('Admin auth check failed:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Yetki kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Router.push ile redirect yapıldı
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-[#111827]">⚙️ Admin Paneli</h1>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-sm rounded-lg bg-slate-200 text-slate-900 hover:bg-slate-300"
            >
              Ana Sayfa
            </button>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Sistem yönetimi ve izleme paneli
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Statistics */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-[#111827] mb-4">👥 Kullanıcı İstatistikleri</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Toplam Kullanıcı</span>
                <span className="font-semibold text-[#111827]">1,234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Aktif Kullanıcı (24s)</span>
                <span className="font-semibold text-green-600">456</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Premium Üyeler</span>
                <span className="font-semibold text-blue-600">89</span>
              </div>
            </div>
          </div>

          {/* Signal Logs */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-[#111827] mb-4">📊 Sinyal Logları</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Son 24 Saat</span>
                <span className="font-semibold text-[#111827]">2,456</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Toplam Sinyal</span>
                <span className="font-semibold text-[#111827]">145,678</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Ortalama Doğruluk</span>
                <span className="font-semibold text-green-600">87.3%</span>
              </div>
            </div>
          </div>

          {/* API Usage */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-[#111827] mb-4">🔌 API Kullanımı</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Günlük İstek</span>
                <span className="font-semibold text-[#111827]">12,345</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Rate Limit Aşımı</span>
                <span className="font-semibold text-red-600">23</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Ortalama Latency</span>
                <span className="font-semibold text-amber-600">245ms</span>
              </div>
            </div>
          </div>

          {/* Model Performance */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-[#111827] mb-4">🤖 Model Performansı</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">AI Doğruluğu</span>
                <span className="font-semibold text-green-600">87.3%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Model Latency</span>
                <span className="font-semibold text-[#111827]">245ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Son Güncelleme</span>
                <span className="font-semibold text-slate-500">2 saat önce</span>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-[#111827] mb-4">🏥 Sistem Sağlığı</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Backend Durum</span>
                <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">Çalışıyor</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">WebSocket Durum</span>
                <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">Bağlı</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Database Durum</span>
                <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">OK</span>
              </div>
            </div>
          </div> */}

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 col-span-1 md:col-span-2 lg:col-span-1">
            <h2 className="text-lg font-semibold text-[#111827] mb-4">📝 Son Aktiviteler</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-slate-600">Model retrain tamamlandı</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">ℹ</span>
                <span className="text-slate-600">API rate limit güncellendi</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-600">⚠</span>
                <span className="text-slate-600">23 kullanıcı rate limit aştı</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

