'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import PlaceholderCard from '@/components/shared/PlaceholderCard';
import {
  getUserSettings,
  updateUserSettings,
  UserSettings,
} from '@/services/userSettings';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace('/login?next=/settings');
    }
  }, [isAuthenticated, router]);

  const query = useQuery({
    queryKey: ['user-settings'],
    queryFn: getUserSettings,
  });

  const mutation = useMutation({
    mutationFn: updateUserSettings,
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      query.refetch();
    },
  });

  const settings = query.data;

  const handleUpdate = (partial: Partial<UserSettings>) => {
    mutation.mutate({ ...settings, ...partial });
  };

  return (
    <>
      <Card
        className="col-span-12"
        title="⚙️ Ayarlar"
        subtitle="AI Bildirimleri • Risk Uyarıları • Görünüm tercihleri"
        actions={
          saved && <Badge text="Kaydedildi" color="green" variant="solid" />
        }
      >
        <p className="text-sm text-slate-600">
          Platform tercihlerini buradan yönet. Tüm değişiklikler lokal olarak saklanır ve AI bildirim motoruna anında yansır.
        </p>
      </Card>

      <Card
        className="col-span-12 xl:col-span-7"
        title="🔔 AI Bildirimleri"
        subtitle="Sinyal ve refresh tercihleri"
      >
        {settings ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Sinyal bildirimi</p>
                <p className="text-xs text-slate-500">AI sinyalleri için push bildirimi gönderilsin</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={settings.notifications}
                  onChange={(event) => handleUpdate({ notifications: event.target.checked })}
                />
                <div className="relative h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-blue-600">
                  <div className="absolute h-5 w-5 translate-x-0.5 translate-y-0.5 rounded-full bg-white transition peer-checked:translate-x-5" />
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Veri yenileme: {settings.refreshInterval}s
              </label>
              <input
                type="range"
                min={5}
                max={30}
                step={5}
                value={settings.refreshInterval}
                onChange={(event) =>
                  handleUpdate({ refreshInterval: Number(event.target.value) as 5 | 15 | 30 })
                }
                className="mt-2 w-full accent-blue-600"
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Ayarlar yükleniyor...</p>
        )}
      </Card>

      <Card
        className="col-span-12 xl:col-span-5"
        title="🎨 Görünüm & Dil"
        subtitle="Tema, dil ve zaman dilimi"
      >
        {settings ? (
          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Tema</label>
              <select
                value={settings.theme}
                onChange={(event) => handleUpdate({ theme: event.target.value as 'light' | 'dark' })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              >
                <option value="light">Açık</option>
                <option value="dark">Koyu</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Dil</label>
              <select
                value={settings.language}
                onChange={(event) => handleUpdate({ language: event.target.value as 'TR' | 'EN' })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              >
                <option value="TR">Türkçe</option>
                <option value="EN">English</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Zaman Dilimi</label>
              <select
                value={settings.timezone}
                onChange={(event) =>
                  handleUpdate({ timezone: event.target.value as 'Europe/Istanbul' | 'UTC' })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              >
                <option value="Europe/Istanbul">Europe/Istanbul</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Ayarlar yükleniyor...</p>
        )}
      </Card>

      <PlaceholderCard
        title="Gelişmiş ayarlar yakında"
        description="API anahtar yönetimi, broker bağlantıları ve otomatik risk profilleri bu bölümde yer alacak."
        badge={{ text: 'Yakında', color: 'blue' }}
      />
    </>
  );
}

