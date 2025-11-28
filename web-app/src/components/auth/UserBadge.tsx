'use client';

import { useMemo } from 'react';
import { useAuth } from './AuthProvider';

export default function UserBadge() {
  const { isAuthenticated, role, logout } = useAuth();

  const badgeLabel = useMemo(() => {
    if (role === 'admin') return 'Yönetici';
    if (role === 'guest') return 'Misafir';
    return 'Trader';
  }, [role]);

  const nameLabel = useMemo(() => {
    if (role === 'admin') return 'Admin';
    if (role === 'guest') return 'Guest';
    return 'Kullanıcı';
  }, [role]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-white/90 backdrop-blur border border-slate-200 rounded-full px-4 py-2 shadow-lg">
      <div className="text-xs text-gray-500 uppercase tracking-wide">{badgeLabel}</div>
      <div className="text-sm font-semibold text-gray-900">{nameLabel}</div>
      <button
        onClick={logout}
        className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
      >
        Çıkış
      </button>
    </div>
  );
}
