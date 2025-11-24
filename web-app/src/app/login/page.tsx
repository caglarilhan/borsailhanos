/**
 * Login Page
 * OWASP-level security, A11y compliant, performant login page
 */

import { LoginForm } from '@/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Giriş Yap • Borsailhanos AI Smart Trader',
  description: 'E-postanızla veya kullanıcı adınızla giriş yapın',
  robots: 'noindex, nofollow', // Login pages shouldn't be indexed
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8" style={{ colorScheme: 'light' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Giriş Yap</h1>
          <p className="text-sm text-slate-600">
            E-postanla veya kullanıcı adınla giriş yap.
          </p>
        </div>
        
        <div className="mb-4">
          <a href="/api/auth/guest?next=/feature/bist30" className="block w-full text-center py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2">
            Şifresiz Devam Et
          </a>
        </div>
        <div className="opacity-70">
          <LoginForm />
        </div>
        
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>⚠️ Yatırım Tavsiyesi Değildir • Analiz ve eğitim amaçlıdır</p>
        </div>
      </div>
    </main>
  );
}

