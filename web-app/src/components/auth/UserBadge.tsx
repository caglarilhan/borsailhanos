'use client';

import { signOut, useSession } from 'next-auth/react';

export default function UserBadge() {
  const { data, status } = useSession();
  if (status !== 'authenticated') {
    return null;
  }
  const name = data?.user?.name || data?.user?.email || data?.user?.role || 'Kullanıcı';
  const role = (data?.user as any)?.role === 'admin' ? 'Yönetici' : 'Trader';

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-white/90 backdrop-blur border border-slate-200 rounded-full px-4 py-2 shadow-lg">
      <div className="text-xs text-gray-500 uppercase tracking-wide">{role}</div>
      <div className="text-sm font-semibold text-gray-900">{name}</div>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
      >
        Çıkış
      </button>
    </div>
  );
}



