import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Desteklenen diller
export const locales = ['en', 'tr', 'de', 'fr', 'es'] as const;
export type Locale = typeof locales[number];

// Varsayılan dil
export const defaultLocale: Locale = 'en';

// Dil bilgileri
export const localeInfo = {
  en: { name: 'English', flag: '🇺🇸', nativeName: 'English' },
  tr: { name: 'Turkish', flag: '🇹🇷', nativeName: 'Türkçe' },
  de: { name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
  fr: { name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  es: { name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' }
};

export default getRequestConfig(async ({ locale }) => {
  // Desteklenmeyen dil için 404
  if (!locales.includes(locale as Locale)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
