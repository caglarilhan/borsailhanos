/**
 * Login Page
 * OWASP-level security, A11y compliant, performant login page
 */

import { LoginForm } from '@/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Giriş Yap • BIST AI Smart Trader',
  description: 'E-postanızla veya kullanıcı adınızla giriş yapın',
  robots: 'noindex, nofollow', // Login pages shouldn't be indexed
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Giriş Yap</h1>
          <p className="text-sm text-slate-600">
            E-postanla veya kullanıcı adınla giriş yap.
          </p>
        </div>
        
        <LoginForm />
        
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>⚠️ Yatırım Tavsiyesi Değildir • Analiz ve eğitim amaçlıdır</p>
        </div>
      </div>
    </main>
  );
}

