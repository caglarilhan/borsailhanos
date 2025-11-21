'use client';

import React, { ReactNode, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowPathIcon,
  ArrowRightStartOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

type AppShellProps = {
  title?: string;
  description?: string;
  lastUpdated?: string;
  onRefresh?: () => void;
  children: ReactNode;
};

const GRID_BASE = 'grid grid-cols-12 gap-4 md:gap-6';

/**
 * AppShell
 * - 12 kolon mobil-first layout, xl'de 24 kolona genişler
 * - Sticky üst navigasyon + floating refresh butonu
 * - useAutoRefresh ile varsayılan 15sn'de bir refresh tetikleme
 */
export function AppShell({
  title = 'BIST AI Smart Trader',
  description = 'AI destekli sinyal ve risk kontrol paneli',
  lastUpdated,
  onRefresh,
  children,
}: AppShellProps) {
  useAutoRefresh(onRefresh, 15000);
  const pathname = usePathname();

  const timestamp = useMemo(() => {
    if (!lastUpdated) return null;
    const date = new Date(lastUpdated);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString();
  }, [lastUpdated]);

  const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Feature', href: '/feature/bist30' },
    { label: 'Watchlist', href: '/watchlist' },
    { label: 'Settings', href: '/settings' },
    { label: 'Admin', href: '/admin' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              AI Workspace
            </p>
            <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-600 shadow-sm md:flex">
              {navItems.map((item) => {
                const active =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'rounded-full px-3 py-1 transition',
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            {timestamp && (
              <span className="hidden text-xs font-medium text-slate-500 sm:inline">
                Güncellendi: {timestamp}
              </span>
            )}
            <button
              type="button"
              onClick={onRefresh}
              className={clsx(
                'inline-flex items-center gap-2 rounded-full border border-slate-300',
                'bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition',
                'hover:border-slate-400 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
              )}
            >
              <ArrowPathIcon className="h-4 w-4" />
              Yenile
            </button>
            <button
              type="button"
              className="hidden rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 md:flex"
              aria-label="Kullanıcı profili"
            >
              <UserCircleIcon className="h-6 w-6" />
            </button>
            <button
              type="button"
              className="hidden rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 md:flex"
              aria-label="Çıkış"
            >
              <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div
          className={clsx(
            GRID_BASE,
            'mx-auto max-w-7xl',
            'md:grid-cols-12 xl:grid-cols-24'
          )}
        >
          {children}
        </div>
      </main>

      <button
        type="button"
        onClick={onRefresh}
        className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        aria-label="Veriyi yenile"
      >
        <ArrowPathIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

export default AppShell;

