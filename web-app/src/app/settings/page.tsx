'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

interface AlertSettings {
  minConfidence: number;
  minPriceChange: number;
  enabled: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<AlertSettings>({
    minConfidence: 70,
    minPriceChange: 5,
    enabled: true,
  });
  const [saved, setSaved] = useState(false);

  // Guard: if not authenticated, redirect to login
  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace('/login?next=/settings');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('alertSettings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...settings, ...parsed });
      } catch (e) {
        console.warn('Failed to parse alert settings:', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('alertSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-[#111827]">⚙️ Ayarlar</h1>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-sm rounded-lg bg-slate-200 text-slate-900 hover:bg-slate-300"
            >
              Ana Sayfa
            </button>
          </div>
        </div>

        {/* Alert Thresholds */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-[#111827] mb-4">🔔 Bildirim Eşikleri</h2>
          
          <div className="space-y-4">
            {/* Enable/Disable Alerts */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-700">Bildirimleri Etkinleştir</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Min Confidence Threshold */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Minimum AI Güven Skoru: {settings.minConfidence}%
              </label>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={settings.minConfidence}
                onChange={(e) => setSettings({ ...settings, minConfidence: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>50%</span>
                <span>95%</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Sadece bu güven skorunun üzerindeki sinyaller için bildirim alırsınız.
              </p>
            </div>

            {/* Min Price Change Threshold */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Minimum Fiyat Değişimi: {settings.minPriceChange}%
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={settings.minPriceChange}
                onChange={(e) => setSettings({ ...settings, minPriceChange: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>1%</span>
                <span>20%</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Sadece bu yüzdenin üzerindeki fiyat değişimleri için bildirim alırsınız.
              </p>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {saved ? '✓ Kaydedildi' : 'Kaydet'}
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-[#111827] mb-4">📱 Bildirim Tercihleri</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Web Bildirimleri</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700">E-posta Bildirimleri</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Display Preferences */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-[#111827] mb-4">🎨 Görünüm Tercihleri</h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tema</label>
              <select className="w-full px-3 py-2 border rounded-lg text-sm">
                <option>Açık</option>
                <option>Koyu</option>
                <option>Sistem</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Dil</label>
              <select className="w-full px-3 py-2 border rounded-lg text-sm">
                <option>Türkçe</option>
                <option>English</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

