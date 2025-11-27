'use client';

import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  console.log('[LOGIN_PAGE] Rendering LoginForm wrapper');
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center mb-4">
          <p className="text-xs uppercase font-semibold text-blue-400 tracking-wide mb-1">
            Borsailhanos AI Smart Trader
          </p>
          <h1 className="text-2xl font-semibold text-white">Hesabınıza giriş yapın</h1>
          <p className="text-sm text-slate-300 mt-1">
            Yetkilendirdiğiniz kullanıcı adı &amp; şifre ile dashboard erişimi sağlayın.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

